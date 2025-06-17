
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Instagram, Youtube, Music } from "lucide-react"

const fetchFooterSettings = async () => {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["footer_address", "footer_phone", "footer_instagram_url", "footer_youtube_url", "footer_tiktok_url"])
  
  if (error) throw new Error(error.message)
  
  return data.reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

const AppFooter = () => {
  const { data: footerSettings } = useQuery({
    queryKey: ["footer_settings"],
    queryFn: fetchFooterSettings,
  })

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
            <div className="space-y-2">
              <p className="text-gray-300">
                {footerSettings?.footer_address || "Alamat perusahaan akan ditampilkan di sini"}
              </p>
              <p className="text-gray-300">
                Telepon: {footerSettings?.footer_phone || "+62 123 456 7890"}
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              {footerSettings?.footer_instagram_url && (
                <a 
                  href={footerSettings.footer_instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {footerSettings?.footer_youtube_url && (
                <a 
                  href={footerSettings.footer_youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Youtube className="h-6 w-6" />
                </a>
              )}
              {footerSettings?.footer_tiktok_url && (
                <a 
                  href={footerSettings.footer_tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Music className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; 2024 Sistem Langganan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default AppFooter;
