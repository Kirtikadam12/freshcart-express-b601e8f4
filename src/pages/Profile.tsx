import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows found"
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your profile.",
        });
      } else if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, authLoading, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      }, { onConflict: 'user_id' });

    if (error) {
      toast({ variant: "destructive", title: "Error saving profile", description: error.message });
    } else {
      toast({ title: "Profile Saved", description: "Your information has been updated." });
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-muted-foreground mb-8">Update your personal and delivery information.</p>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>This information will be used for delivery and order updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" value={profile.full_name || ""} onChange={handleInputChange} placeholder="Your full name"/></div>
          <div className="grid gap-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" value={profile.phone || ""} onChange={handleInputChange} placeholder="Your contact number"/></div>
          <div className="grid gap-2"><Label htmlFor="address">Delivery Address</Label><Textarea id="address" name="address" value={profile.address || ""} onChange={handleInputChange} placeholder="Your full delivery address" rows={3}/></div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save Changes")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}