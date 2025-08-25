'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { getOpenAIApiKey, setOpenAIApiKey, getFinancialDatasetsApiKey, setFinancialDatasetsApiKey } from '@/lib/db/api-keys';
import { validateOpenAIKey } from '@/lib/utils/api-key-validation';


interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ApiKeysModal({ 
  open, 
  onOpenChange, 
  title = "Configure API keys",
  description 
}: ApiKeysModalProps) {
  const [openAIKey, setOpenAIKey] = useState(getOpenAIApiKey() || '');
  const [financialKey, setFinancialKey] = useState(getFinancialDatasetsApiKey() || '');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFinancialKey, setShowFinancialKey] = useState(false);
  const [openAIError, setOpenAIError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverKeys, setServerKeys] = useState<any>(null);

  useEffect(() => {
    // Check if server-side keys are available
    fetch('/api/keys')
      .then(res => res.json())
      .then(data => {
        setServerKeys(data);
        // If server has Inference key, pre-populate the OpenAI field
        if (data.hasInferenceKey && !openAIKey) {
          setOpenAIKey(data.inferenceKey);
        }
        // If server has Financial key, pre-populate that field
        if (data.hasFinancialKey && !financialKey) {
          setFinancialKey(data.financialKey);
        }
      })
      .catch(console.error);
  }, [openAIKey, financialKey]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setOpenAIError('');

      // Skip validation if server keys are configured
      if (!serverKeys?.hasInferenceKey && !serverKeys?.hasOpenAIKey) {
        const { isValid, error } = await validateOpenAIKey(openAIKey);
        
        if (!isValid) {
          setOpenAIError(error ?? 'Invalid OpenAI API key');
          return;
        }
      }

      await Promise.all([
        setOpenAIApiKey(openAIKey),
        setFinancialDatasetsApiKey(financialKey)
      ]);

      onOpenChange(false);
    } catch (error) {
      setOpenAIError('An unexpected error occurred. Please try again.');
      console.error('Error saving API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key {serverKeys?.hasInferenceKey && <span className="text-green-600">(Using Heroku Inference)</span>}
            </label>
            <div className="relative">
              <Input
                id="openai-key"
                type={showOpenAIKey ? "text" : "password"}
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder={serverKeys?.hasInferenceKey ? "Using server-configured key" : "sk-..."}
                disabled={serverKeys?.hasInferenceKey}
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {openAIError && (
              <p className="text-sm text-red-500 mt-1">
                {openAIError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {serverKeys?.hasInferenceKey ? (
                "✅ API key is configured on the server using Heroku Inference"
              ) : (
                <>
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="financial-key" className="text-sm font-medium">
              Financial Data API Key {serverKeys?.hasFinancialKey && <span className="text-green-600">(Configured)</span>}
            </label>
            <div className="relative">
              <Input
                id="financial-key"
                type={showFinancialKey ? "text" : "password"}
                value={financialKey}
                onChange={(e) => setFinancialKey(e.target.value)}
                placeholder={serverKeys?.hasFinancialKey ? "Using server-configured key" : "Enter your Financial Data API key"}
                disabled={serverKeys?.hasFinancialKey}
              />
              <button
                type="button"
                onClick={() => setShowFinancialKey(!showFinancialKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showFinancialKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {serverKeys?.hasFinancialKey ? (
                "✅ API key is configured on the server"
              ) : (
                "Financial data API key for market data access"
              )}
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 