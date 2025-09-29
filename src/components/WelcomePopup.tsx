
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
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-muted/20 border-0 shadow-2xl">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 sm:p-6 rounded-t-lg">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pr-8">
              {popupSettings?.popup_title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {popupSettings?.popup_image_url && (
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img
                  src={popupSettings.popup_image_url}
                  alt="Popup image"
                  className="relative max-w-full h-auto rounded-xl max-h-48 sm:max-h-64 md:max-h-80 object-cover shadow-lg"
                />
              </div>
            </div>
          )}
          
          <DialogDescription className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-center sm:text-left text-muted-foreground">
            {popupSettings?.popup_content}
          </DialogDescription>
          
          {/* Enhanced button area */}
          <div className="flex justify-center pt-4 sm:pt-6">
            <Button 
              onClick={handleClose} 
              className="px-8 sm:px-12 py-3 w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
