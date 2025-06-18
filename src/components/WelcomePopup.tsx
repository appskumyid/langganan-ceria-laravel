
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
    // Check if popup should be shown and hasn't been shown in this session
    const shouldShowPopup = popupSettings?.popup_enabled === 'true' && 
                           popupSettings?.popup_title && 
                           popupSettings?.popup_content &&
                           !hasShown;

    if (shouldShowPopup) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [popupSettings, hasShown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!popupSettings?.popup_enabled || popupSettings?.popup_enabled !== 'true') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {popupSettings?.popup_title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {popupSettings?.popup_image_url && (
            <div className="flex justify-center">
              <img
                src={popupSettings.popup_image_url}
                alt="Popup image"
                className="max-w-full h-auto rounded-lg"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}
          
          <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
            {popupSettings?.popup_content}
          </DialogDescription>
          
          <div className="flex justify-center pt-4">
            <Button onClick={handleClose} className="px-8">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
