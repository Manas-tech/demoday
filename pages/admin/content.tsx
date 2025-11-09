import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import Page from '@components/page';
import Layout from '@components/layout';
import Header from '@components/header';
import useRole from '@lib/hooks/use-role';
import useAuth from '@lib/hooks/use-auth';
import { getAllSpeakers, getAllSponsors, getAllStages, getAllJobs } from '@lib/cms-api';
import { Speaker, Sponsor, Stage, Job } from '@lib/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type ContentType = 'speakers' | 'event-schedule' | 'companies';

type Props = {
  speakers: Speaker[];
  sponsors: Sponsor[];
  stages: Stage[];
  jobs: Job[];
};

// Form Input Component
const FormInput = ({ label, value, onChange, placeholder, required = false, type = 'text', textarea = false, rows = 3 }: any) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>
      {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
    </label>
    {textarea ? (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '80px'
        }}
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
      />
    )}
  </div>
);

// Image Upload Component
const ImageUpload = ({ label, value, onChange, folder = 'uploads' }: { label: string; value: string; onChange: (url: string) => void; folder?: string }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: {
            name: file.name,
            type: file.type,
            data: base64
          },
          folder
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      onChange(url);
      setPreview(url);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#333' }}>
        {label}
      </label>
      
      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: '12px' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              objectFit: 'cover'
            }}
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange('');
            }}
            style={{
              marginLeft: '8px',
              padding: '4px 8px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label
          style={{
            padding: '10px 16px',
            background: uploading ? '#ccc' : '#FF7B00',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'inline-block'
          }}
        >
          {uploading ? 'Uploading...' : '📷 Upload Image'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <span style={{ color: '#666', fontSize: '12px' }}>or</span>
        <input
          type="url"
          value={value || ''}
          onChange={e => {
            onChange(e.target.value);
            setPreview(e.target.value || null);
          }}
          placeholder="Enter image URL"
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>
      <p style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
        Upload from device or paste image URL (Max 5MB)
      </p>
    </div>
  );
};

// Speaker Form Component
const SpeakerForm = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
    <FormInput
      label="Name"
      value={data.name}
      onChange={(val: string) => onChange({ ...data, name: val })}
      placeholder="John Doe"
      required
    />
    <FormInput
      label="Slug"
      value={data.slug}
      onChange={(val: string) => onChange({ ...data, slug: val })}
      placeholder="john-doe"
      required
    />
    <FormInput
      label="Title"
      value={data.title}
      onChange={(val: string) => onChange({ ...data, title: val })}
      placeholder="CEO"
      required
    />
    <FormInput
      label="Company"
      value={data.company}
      onChange={(val: string) => onChange({ ...data, company: val })}
      placeholder="Acme Inc"
      required
    />
    <FormInput
      label="Bio"
      value={data.bio}
      onChange={(val: string) => onChange({ ...data, bio: val })}
      placeholder="Speaker biography..."
      textarea
      rows={5}
      required
    />
    <ImageUpload
      label="Image"
      value={data.image?.url || ''}
      onChange={(url: string) => onChange({ ...data, image: { url }, imageSquare: { url: data.imageSquare?.url || url } })}
      folder="speakers"
    />
    <ImageUpload
      label="Square Image"
      value={data.imageSquare?.url || ''}
      onChange={(url: string) => onChange({ ...data, imageSquare: { url } })}
      folder="speakers"
    />
    <FormInput
      label="Twitter"
      value={data.twitter}
      onChange={(val: string) => onChange({ ...data, twitter: val })}
      placeholder="@johndoe"
    />
    <FormInput
      label="GitHub"
      value={data.github}
      onChange={(val: string) => onChange({ ...data, github: val })}
      placeholder="johndoe"
    />
    <FormInput
      label="LinkedIn"
      value={data.linkedin}
      onChange={(val: string) => onChange({ ...data, linkedin: val })}
      placeholder="johndoe"
    />
  </div>
);

// Company Form Component
const CompanyForm = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => {
  const [links, setLinks] = useState(data.links || []);

  const updateLinks = (newLinks: any[]) => {
    setLinks(newLinks);
    onChange({ ...data, links: newLinks });
  };

  const addLink = () => {
    updateLinks([...links, { text: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    updateLinks(links.filter((_: any, i: number) => i !== index));
  };

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateLinks(newLinks);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <FormInput
          label="Company Name"
          value={data.name}
          onChange={(val: string) => onChange({ ...data, name: val })}
          placeholder="Acme Inc"
          required
        />
        <FormInput
          label="Slug"
          value={data.slug}
          onChange={(val: string) => onChange({ ...data, slug: val })}
          placeholder="acme-inc"
          required
        />
        <FormInput
          label="Tier"
          value={data.tier}
          onChange={(val: string) => onChange({ ...data, tier: val })}
          placeholder="Gold, Silver, Bronze"
        />
        <FormInput
          label="Website"
          value={data.website || ''}
          onChange={(val: string) => onChange({ ...data, website: val || null })}
          placeholder="https://example.com"
          type="url"
        />
        <FormInput
          label="Discord"
          value={data.discord || ''}
          onChange={(val: string) => onChange({ ...data, discord: val || null })}
          placeholder="discord.gg/..."
        />
        <FormInput
          label="YouTube Video ID"
          value={data.youtubeSlug || ''}
          onChange={(val: string) => {
            let videoId = val.trim();
            if (val.includes('youtube.com/watch?v=')) {
              videoId = val.split('v=')[1]?.split('&')[0] || val;
            } else if (val.includes('youtu.be/')) {
              videoId = val.split('youtu.be/')[1]?.split('?')[0] || val;
            }
            onChange({ ...data, youtubeSlug: videoId || null });
          }}
          placeholder="VIDEO_ID or full YouTube URL"
        />
        {data.youtubeSlug && (
          <div style={{ gridColumn: '1 / -1', marginTop: '-10px', marginBottom: '10px' }}>
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${data.youtubeSlug}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '6px', maxWidth: '500px' }}
            />
          </div>
        )}
        <FormInput
          label="Short Description"
          value={data.shortDescription || ''}
          onChange={(val: string) => onChange({ ...data, shortDescription: val || null })}
          placeholder="Brief one-line description"
        />
        <FormInput
          label="Description"
          value={data.description}
          onChange={(val: string) => onChange({ ...data, description: val })}
          placeholder="Full company description..."
          textarea
          rows={5}
          required
        />
        <FormInput
          label="Founders"
          value={data.founders || ''}
          onChange={(val: string) => onChange({ ...data, founders: val || null })}
          placeholder="Founder names"
        />
        <FormInput
          label="Call to Action Text"
          value={data.callToAction || ''}
          onChange={(val: string) => onChange({ ...data, callToAction: val || null })}
          placeholder="Learn More"
        />
        <FormInput
          label="Call to Action Link"
          value={data.callToActionLink || ''}
          onChange={(val: string) => onChange({ ...data, callToActionLink: val || null })}
          placeholder="https://example.com/learn-more"
          type="url"
        />
        <ImageUpload
          label="Card Image"
          value={data.cardImage?.url || ''}
          onChange={(url: string) => onChange({ ...data, cardImage: { url } })}
          folder="companies"
        />
        <ImageUpload
          label="Logo"
          value={data.logo?.url || ''}
          onChange={(url: string) => onChange({ ...data, logo: { url } })}
          folder="companies"
        />
      </div>

      {/* Links Section */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Company Links</h4>
          <button
            onClick={addLink}
            style={{
              padding: '8px 16px',
              background: '#FF7B00',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            + Add Link
          </button>
        </div>
        {links.map((link: any, index: number) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
            <input
              type="text"
              value={link.text || ''}
              onChange={e => updateLink(index, 'text', e.target.value)}
              placeholder="Link text"
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <input
              type="url"
              value={link.url || ''}
              onChange={e => updateLink(index, 'url', e.target.value)}
              placeholder="https://example.com"
              style={{
                flex: 2,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => removeLink(index)}
              style={{
                padding: '10px 16px',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Remove
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
            No links added. Click "Add Link" to add company resources.
          </p>
        )}
      </div>
    </div>
  );
};

// Stage Form Component
const StageForm = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
    <FormInput
      label="Stage Name"
      value={data.name}
      onChange={(val: string) => onChange({ ...data, name: val })}
      placeholder="Main Stage"
      required
    />
    <FormInput
      label="Slug"
      value={data.slug}
      onChange={(val: string) => onChange({ ...data, slug: val })}
      placeholder="main-stage"
      required
    />
    <FormInput
      label="Stream URL"
      value={data.stream}
      onChange={(val: string) => onChange({ ...data, stream: val })}
      placeholder="YouTube URL or stream URL"
    />
    <FormInput
      label="Discord"
      value={data.discord}
      onChange={(val: string) => onChange({ ...data, discord: val })}
      placeholder="discord.gg/..."
    />
    <FormInput
      label="Room ID"
      value={data.roomId}
      onChange={(val: string) => onChange({ ...data, roomId: val })}
      placeholder="100ms Room ID"
    />
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="checkbox"
        checked={data.isLive || false}
        onChange={e => onChange({ ...data, isLive: e.target.checked })}
        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
      />
      <label style={{ fontSize: '14px', fontWeight: 600 }}>Is Live (100ms enabled)</label>
    </div>
  </div>
);

export default function ContentManagement({ speakers, sponsors, stages, jobs }: Props) {
  const router = useRouter();
  const { role, loading: roleLoading, isAdmin } = useRole();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ContentType>('speakers');
  const [data, setData] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create authenticated Supabase client
  const getSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    const client = createClient(supabaseUrl, supabaseAnonKey);
    return client;
  };

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (!isAdmin) {
        console.warn('Access denied: User is not admin. Role:', role, 'User:', user?.email);
        router.replace('/');
        return;
      }
    }
  }, [authLoading, roleLoading, user, isAdmin, role, router]);

  const loadData = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (activeTab === 'speakers') {
          const { data, error } = await supabase
            .from('speakers')
            .select('*')
            .order('name');
          
          if (!error && data) {
            setData(data.map((s: any) => ({
              name: s.name,
              slug: s.slug,
              title: s.title,
              company: s.company,
              bio: s.bio,
              image: { url: s.image_url || '' },
              imageSquare: { url: s.image_square_url || s.image_url || '' },
              twitter: s.twitter || '',
              github: s.github || '',
              linkedin: s.linkedin || ''
            })));
          }
        } else if (activeTab === 'companies') {
          const { data: companies, error } = await supabase
            .from('companies')
            .select(`
              *,
              company_links (*)
            `)
            .order('name');
          
          if (!error && companies) {
            setData(companies.map((c: any) => ({
              name: c.name,
              slug: c.slug,
              description: c.description,
              shortDescription: c.short_description,
              website: c.website,
              callToAction: c.call_to_action,
              callToActionLink: c.call_to_action_link,
              discord: c.discord,
              tier: c.tier,
              youtubeSlug: c.youtube_slug,
              cardImage: { url: c.card_image_url || '' },
              logo: { url: c.logo_url || c.card_image_url || '' },
              links: (c.company_links || []).map((link: any) => ({
                text: link.text,
                url: link.url
              })),
              founders: c.founders
            })));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    } else {
      switch (activeTab) {
        case 'speakers':
          setData(speakers);
          break;
        case 'event-schedule':
          setData(stages);
          break;
        case 'companies':
          setData(sponsors);
          break;
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);
  
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      switch (activeTab) {
        case 'speakers':
          setData(speakers);
          break;
        case 'event-schedule':
          setData(stages);
          break;
        case 'companies':
          setData(sponsors);
          break;
      }
    }
  }, [activeTab, speakers, sponsors, stages]);
  
  if (authLoading || roleLoading) {
    return (
      <Page meta={{ title: 'Content Management', description: 'Manage content' }}>
        <Layout>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </Layout>
      </Page>
    );
  }
  
  if (!user || !isAdmin) {
    return null;
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    const cloned = JSON.parse(JSON.stringify(data[index]));
    setEditData(cloned);
  };

  const handleSave = async () => {
    if (editingIndex === null || !editData) {
      alert('No data to save');
      return;
    }
    
    if (saving) return; // Prevent double clicks
    setSaving(true);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        alert('Database connection not available');
        setSaving(false);
        return;
      }
      
      if (activeTab === 'speakers') {
        const { error } = await supabase
            .from('speakers')
            .update({
              name: editData.name || '',
              slug: editData.slug || '',
              title: editData.title || '',
              company: editData.company || '',
              bio: editData.bio || '',
              image_url: editData.image?.url || '',
              image_square_url: editData.imageSquare?.url || editData.image?.url || '',
              twitter: editData.twitter || '',
              github: editData.github || '',
              linkedin: editData.linkedin || ''
            })
            .eq('slug', data[editingIndex].slug);
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
      } else if (activeTab === 'companies') {
        if (!editData.name || !editData.slug) {
          alert('Name and slug are required fields');
          setSaving(false);
          return;
        }
        
        const companyData: any = {
            name: editData.name,
            slug: editData.slug,
            description: editData.description || null,
            short_description: editData.shortDescription || null,
            website: editData.website || null,
            call_to_action: editData.callToAction || null,
            call_to_action_link: editData.callToActionLink || null,
            discord: editData.discord || null,
            tier: editData.tier || null,
            youtube_slug: editData.youtubeSlug || null,
            card_image_url: editData.cardImage?.url || '',
            logo_url: editData.logo?.url || '',
            founders: editData.founders || null
          };
          
          const { error: updateError } = await supabase
            .from('companies')
            .update(companyData)
            .eq('slug', data[editingIndex].slug);
        
        if (updateError) {
          console.error('Supabase update error:', updateError);
          throw updateError;
        }
        
        if (editData.links && Array.isArray(editData.links)) {
            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('id')
              .eq('slug', editData.slug)
              .single();
            
            if (companyError) {
              console.error('Error fetching company:', companyError);
            } else if (company) {
              await supabase
                .from('company_links')
                .delete()
                .eq('company_id', company.id);
              
              if (editData.links.length > 0) {
                const { error: insertError } = await supabase
                  .from('company_links')
                  .insert(editData.links.map((link: any) => ({
                    company_id: company.id,
                    text: link.text || '',
                    url: link.url || ''
                  })));
                
                if (insertError) {
                  console.error('Error inserting links:', insertError);
                }
            }
          }
        }
      }
      
      await loadData();
      alert('Changes saved successfully!');
      setEditingIndex(null);
      setEditData(null);
      setSaving(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Error saving: ${errorMessage}\n\nPlease check the browser console for details.`);
      console.error('Error saving:', error);
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem = getDefaultItem(activeTab);
    setEditData(newItem);
    setShowAddForm(true);
  };

  const handleAddSave = async () => {
    if (!editData) {
      alert('No data to save');
      return;
    }
    
    if (saving) return; // Prevent double clicks
    setSaving(true);
    
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        alert('Database connection not available');
        setSaving(false);
        return;
      }
        if (activeTab === 'speakers') {
          if (!editData.name || !editData.slug) {
            alert('Name and slug are required fields');
            setSaving(false);
            return;
          }
          
          const { error } = await supabase
            .from('speakers')
            .insert({
              name: editData.name,
              slug: editData.slug,
              title: editData.title || '',
              company: editData.company || '',
              bio: editData.bio || '',
              image_url: editData.image?.url || '',
              image_square_url: editData.imageSquare?.url || editData.image?.url || '',
              twitter: editData.twitter || '',
              github: editData.github || '',
              linkedin: editData.linkedin || ''
            });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
      } else if (activeTab === 'companies') {
        if (!editData.name || !editData.slug) {
          alert('Name and slug are required fields');
          setSaving(false);
          return;
        }
        
        const companyData = {
          name: editData.name.trim(),
          slug: editData.slug.trim(),
          description: editData.description?.trim() || null,
          short_description: editData.shortDescription?.trim() || null,
          website: editData.website?.trim() || null,
          call_to_action: editData.callToAction?.trim() || null,
          call_to_action_link: editData.callToActionLink?.trim() || null,
          discord: editData.discord?.trim() || null,
          tier: editData.tier?.trim() || null,
          youtube_slug: editData.youtubeSlug?.trim() || null,
          card_image_url: editData.cardImage?.url?.trim() || '',
          logo_url: editData.logo?.url?.trim() || '',
          founders: editData.founders?.trim() || null
        };
        
        console.log('Inserting company:', companyData);
        
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single();
        
        if (companyError) {
          console.error('Supabase insert error:', companyError);
          throw companyError;
        }
        
        if (!company) {
          throw new Error('Company was not created - no data returned');
        }
        
        console.log('Company created successfully:', company);
        
        if (company && editData.links && Array.isArray(editData.links)) {
          // Filter out empty links (where both text and url are empty)
          const validLinks = editData.links.filter((link: any) => 
            link && (link.text?.trim() || link.url?.trim())
          );
          
          if (validLinks.length > 0) {
            const { error: linksError } = await supabase
              .from('company_links')
              .insert(validLinks.map((link: any) => ({
                company_id: company.id,
                text: link.text?.trim() || '',
                url: link.url?.trim() || ''
              })));
            
            if (linksError) {
              console.error('Error inserting links:', linksError);
              // Don't throw - company was created successfully, links are optional
            }
          }
        }
      }
      
      await loadData();
      setShowAddForm(false);
      setEditData(null);
      setSaving(false);
      alert('Item added successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorCode = error?.code || '';
      const errorDetails = error?.details || '';
      console.error('Error adding item:', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        fullError: error
      });
      alert(`Error adding item: ${errorMessage}${errorCode ? ` (${errorCode})` : ''}\n\nPlease check the browser console for details.`);
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const item = data[index];
        const supabase = getSupabaseClient();
        if (supabase) {
          if (activeTab === 'speakers') {
            const { error } = await supabase
              .from('speakers')
              .delete()
              .eq('slug', item.slug);
            
            if (error) throw error;
          } else if (activeTab === 'companies') {
            const { data: company } = await supabase
              .from('companies')
              .select('id')
              .eq('slug', item.slug)
              .single();
            
            if (company) {
              await supabase
                .from('company_links')
                .delete()
                .eq('company_id', company.id);
            }
            
            const { error } = await supabase
              .from('companies')
              .delete()
              .eq('slug', item.slug);
            
            if (error) throw error;
          }
        }
        
        await loadData();
        alert('Item deleted successfully!');
      } catch (error: any) {
        alert(`Error deleting item: ${error.message}`);
        console.error('Error deleting:', error);
      }
    }
  };

  const getDefaultItem = (type: ContentType): any => {
    switch (type) {
      case 'speakers':
        return {
          name: '',
          bio: '',
          title: '',
          slug: '',
          twitter: '',
          github: '',
          company: '',
          linkedin: '',
          image: { url: '' },
          imageSquare: { url: '' }
        };
      case 'event-schedule':
        return {
          name: '',
          slug: '',
          stream: '',
          discord: '',
          schedule: [],
          isLive: false,
          roomId: '',
          stagePeers: [],
          backstagePeers: []
        };
      case 'companies':
        return {
          name: '',
          description: '',
          slug: '',
          website: null,
          callToAction: null,
          callToActionLink: null,
          discord: null,
          youtubeSlug: null,
          tier: null,
          links: [],
          cardImage: { url: '' },
          logo: { url: '' },
          shortDescription: null,
          founders: null
        };
      default:
        return {};
    }
  };

  const renderForm = () => {
    if (activeTab === 'speakers') {
      return <SpeakerForm data={editData} onChange={setEditData} />;
    } else if (activeTab === 'companies') {
      return <CompanyForm data={editData} onChange={setEditData} />;
    } else if (activeTab === 'event-schedule') {
      return <StageForm data={editData} onChange={setEditData} />;
    }
    return null;
  };

  const meta = {
    title: 'Content Management - Admin',
    description: 'Manage site content'
  };

  return (
    <Page meta={meta}>
      <Layout>
        <div style={{ width: '100%', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 32px', background: '#fff', borderBottom: '2px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#FF7B00', textTransform: 'uppercase' }}>
              Content Management
            </h1>
            <button
              onClick={handleAdd}
              style={{
                padding: '12px 24px',
                background: '#FF7B00',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              + Add New
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0', background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
            {([
              { key: 'speakers' as ContentType, label: 'Speakers', count: speakers.length },
              { key: 'event-schedule' as ContentType, label: 'Event Schedule', count: stages.length },
              { key: 'companies' as ContentType, label: 'Companies', count: sponsors.length }
            ]).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '16px 32px',
                  background: activeTab === key ? '#fff' : 'transparent',
                  color: activeTab === key ? '#FF7B00' : '#666',
                  border: 'none',
                  borderBottom: activeTab === key ? '3px solid #FF7B00' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '32px', background: '#fafafa' }}>
            {showAddForm && (
              <div style={{ marginBottom: '24px', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#333' }}>Add New {activeTab.slice(0, -1)}</h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditData(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#ccc',
                      color: '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                {renderForm()}
                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditData(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#ccc',
                      color: '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '15px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSave}
                    disabled={saving}
                    style={{
                      padding: '12px 24px',
                      background: saving ? '#ccc' : '#FF7B00',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '15px',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
              {data.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '24px',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {editingIndex === index ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#333' }}>Editing: {item.name || item.title || `Item ${index + 1}`}</h3>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditData(null);
                          }}
                          style={{
                            padding: '8px 16px',
                            background: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      {renderForm()}
                      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setEditingIndex(null);
                            setEditData(null);
                          }}
                          style={{
                            padding: '12px 24px',
                            background: '#ccc',
                            color: '#333',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          style={{
                            padding: '12px 24px',
                            background: saving ? '#ccc' : '#FF7B00',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            opacity: saving ? 0.6 : 1
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>
                            {item.name || item.title || item.companyName || `Item ${index + 1}`}
                          </h3>
                          {item.slug && <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>Slug: {item.slug}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(index)}
                            style={{
                              padding: '8px 16px',
                              background: '#FF7B00',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            style={{
                              padding: '8px 16px',
                              background: '#dc3545',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        fontSize: '13px',
                        color: '#555',
                        lineHeight: '1.6'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          {Object.entries(item).slice(0, 6).map(([key, value]: [string, any]) => {
                            if (key === 'image' || key === 'imageSquare' || key === 'cardImage' || key === 'logo') {
                              return (
                                <div key={key}>
                                  <strong>{key}:</strong> {value?.url ? <a href={value.url} target="_blank" rel="noopener noreferrer" style={{ color: '#FF7B00' }}>View Image</a> : 'N/A'}
                                </div>
                              );
                            }
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) return null;
                            if (Array.isArray(value)) {
                              return (
                                <div key={key}>
                                  <strong>{key}:</strong> {value.length} item(s)
                                </div>
                              );
                            }
                            return (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value || 'N/A').substring(0, 50)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {data.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: '#666', background: '#fff', borderRadius: '12px' }}>
                <p style={{ fontSize: '18px', margin: 0 }}>No {activeTab} found.</p>
                <p style={{ fontSize: '14px', margin: '8px 0 0 0', color: '#999' }}>Click "Add New" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const [speakers, sponsors, stages, jobs] = await Promise.all([
      getAllSpeakers(),
      getAllSponsors(),
      getAllStages(),
      getAllJobs()
    ]);

    return {
      props: {
        speakers: speakers || [],
        sponsors: sponsors || [],
        stages: stages || [],
        jobs: jobs || []
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error loading content data:', error);
    return {
      props: {
        speakers: [],
        sponsors: [],
        stages: [],
        jobs: []
      }
    };
  }
};
