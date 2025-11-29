'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface UserLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface LinkFormData {
  title: string;
  url: string;
  order: number;
}

export default function LinkManager() {
  const [links, setLinks] = useState<UserLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLinks, setEditingLinks] = useState<LinkFormData[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/user-links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        setEditingLinks(
          data.links?.map((link: UserLink) => ({
            title: link.title,
            url: link.url,
            order: link.order,
          })) || [],
        );
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
      setMessage({ type: 'error', text: 'Failed to load your links' });
    } finally {
      setIsLoading(false);
    }
  };

  const addEmptyLink = () => {
    if (editingLinks.length >= 3) {
      setMessage({ type: 'error', text: 'You can only have up to 3 links' });
      return;
    }

    const newLink: LinkFormData = {
      title: '',
      url: '',
      order: editingLinks.length + 1,
    };
    setEditingLinks([...editingLinks, newLink]);
  };

  const updateLink = (index: number, field: keyof LinkFormData, value: string | number) => {
    const updated = [...editingLinks];
    updated[index] = { ...updated[index], [field]: value };
    setEditingLinks(updated);
  };

  const removeLink = (index: number) => {
    const updated = editingLinks.filter((_, i) => i !== index);
    // Reorder remaining links
    const reordered = updated.map((link, i) => ({ ...link, order: i + 1 }));
    setEditingLinks(reordered);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const saveLinks = async () => {
    // Validate all links
    const validLinks = editingLinks.filter(
      link => link.title.trim() !== '' && link.url.trim() !== '',
    );

    for (const link of validLinks) {
      if (link.title.length < 3 || link.title.length > 50) {
        setMessage({ type: 'error', text: 'Link titles must be between 3 and 50 characters' });
        return;
      }

      if (!validateUrl(link.url)) {
        setMessage({ type: 'error', text: 'Please enter valid URLs (including https://)' });
        return;
      }
    }

    // Check for duplicate URLs
    const urls = validLinks.map(link => link.url);
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      setMessage({ type: 'error', text: 'Please use unique URLs for each link' });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/user-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validLinks),
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data.links);
        setMessage({ type: 'success', text: 'Your links have been updated' });
        await fetchLinks(); // Refresh the data
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save links' });
      }
    } catch (error) {
      console.error('Failed to save links:', error);
      setMessage({ type: 'error', text: 'Failed to save links' });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (links.length !== editingLinks.length) return true;

    return editingLinks.some((editingLink, index) => {
      const originalLink = links[index];
      if (!originalLink) return true;

      return editingLink.title !== originalLink.title || editingLink.url !== originalLink.url;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Your Links</h4>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Your Links</h4>
        <span className="text-xs text-muted-foreground">{editingLinks.length}/3 links</span>
      </div>

      <div className="space-y-3">
        {editingLinks.map((link, index) => (
          <div key={index} className="space-y-2 p-3 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Link {index + 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeLink(index)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                ×
              </Button>
            </div>

            <Input
              placeholder="Link title (e.g., Portfolio)"
              value={link.title}
              onChange={e => updateLink(index, 'title', e.target.value)}
              className="text-sm"
              maxLength={50}
            />

            <Input
              placeholder="https://example.com"
              value={link.url}
              onChange={e => updateLink(index, 'url', e.target.value)}
              className="text-sm"
              type="url"
            />
          </div>
        ))}

        {editingLinks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No links added yet. Add up to 3 links to display on your profile.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          {editingLinks.length < 3 && (
            <Button variant="outline" size="sm" onClick={addEmptyLink} className="flex-1">
              + Add Link
            </Button>
          )}

          {editingLinks.length > 0 && hasChanges() && (
            <Button size="sm" onClick={saveLinks} disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>

        {links.length > 0 && !hasChanges() && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            ✓ Your links are saved and will appear on your trainer profile
          </div>
        )}

        {message && (
          <div
            className={`text-xs text-center pt-2 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
