
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const fetchPopupSettings = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['popup_enabled', 'popup_title', 'popup_content', 'popup_image_url']);
  
  if (error) throw new Error(error.message);
  
  return data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
};

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const { data: popupSettings } = useQuery({
    queryKey: ['popup_settings'],
    queryFn: fetchPopupSettings,
  });

  useEffect(() => {
    // Check if popup should be shown and hasn't been shown in this session (make public)
    const shouldShowPopup = popupSettings?.popup_enabled === 'true' && 
                           popupSettings?.popup_title && 
                           popupSettings?.popup_content &&
                           !hasShown;

    if (shouldShowPopup) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [popupSettings, hasShown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Remove auth check to make popup public
  if (!popupSettings?.popup_enabled || popupSettings?.popup_enabled !== 'true') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold pr-8">
              {popupSettings?.popup_title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          {popupSettings?.popup_image_url && (
            <div className="flex justify-center">
              <img
                src={popupSettings.popup_image_url}
                alt="Popup image"
                className="max-w-full h-auto rounded-lg max-h-48 sm:max-h-64 md:max-h-80 object-contain"
              />
            </div>
          )}
          
          <DialogDescription className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-center sm:text-left">
            {popupSettings?.popup_content}
          </DialogDescription>
          
          <div className="flex justify-center pt-2 sm:pt-4">
            <Button onClick={handleClose} className="px-6 sm:px-8 w-full sm:w-auto">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
