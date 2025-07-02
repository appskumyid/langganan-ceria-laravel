
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, ExternalLink, Key, AlertCircle } from 'lucide-react';

export const GitHubTokenSetup = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Deploy Setup
        </CardTitle>
        <CardDescription>
          Configure GitHub token untuk deploy otomatis ke repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            Untuk deploy ke GitHub, admin perlu menambahkan GITHUB_TOKEN di Supabase project secrets.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowInstructions(!showInstructions)}
          >
            {showInstructions ? 'Hide' : 'Show'} Setup Instructions
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            GitHub Token Settings
          </Button>
        </div>

        {showInstructions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Cara Setup GitHub Token:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Buka <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub Personal Access Tokens</a></li>
              <li>Klik "Generate new token" → "Generate new token (classic)"</li>
              <li>Beri nama token (contoh: "Website Deploy")</li>
              <li>Pilih scope yang diperlukan:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><code>repo</code> - Full control of private repositories</li>
                  <li><code>public_repo</code> - Access public repositories</li>
                </ul>
              </li>
              <li>Klik "Generate token" dan copy token yang dihasilkan</li>
              <li>Di Supabase Dashboard → Project Settings → Edge Functions → Add secret:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Name: <code>GITHUB_TOKEN</code></li>
                  <li>Value: paste token dari GitHub</li>
                </ul>
              </li>
            </ol>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Penting:</strong> Simpan token dengan aman. GitHub hanya menampilkan token sekali saja.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
