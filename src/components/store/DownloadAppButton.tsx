import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function DownloadAppButton() {
  const [appDownloadUrl, setAppDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('app_download_url')
        .limit(1)
        .maybeSingle();
      
      if (data?.app_download_url) {
        setAppDownloadUrl(data.app_download_url);
      }
    };
    fetchSettings();
  }, []);

  if (!appDownloadUrl) return null;

  return (
    <a href={appDownloadUrl} download>
      <Button variant="outline" size="sm" className="gap-2">
        <Download className="w-4 h-4" />
        <span>تنزيل التطبيق</span>
      </Button>
    </a>
  );
}
