export type UserType = 'volunteer' | 'organization';

export interface UserPublic {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  city?: string;
  avatar?: string | null;
}

export interface VolunteerPublic {
  id: number;
  user: UserPublic;
  rating: number;
  is_active: boolean;
}

export interface OrganizationPublic {
  id: number;
  name: string;
  rating: number;
}

export interface OrganizationDetail extends OrganizationPublic {
  user: UserPublic;
  description?: string;
  logo?: string | null;
  website?: string;
  contact_email?: string;
  address?: string;
  is_verified?: boolean;
  created_at?: string;
}

export interface VolunteerDetail extends VolunteerPublic {
  skills?: string;
  experience?: string;
  date_of_birth?: string | null;
  created_at?: string;
}

export interface EventSummary {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Event extends EventSummary {
  description: string;
  location: string;
  required_volunteers: number;
  status_label?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  organization: OrganizationPublic;
  approved_count: number;
}

export interface VolunteerApplication {
  id: number;
  volunteer: VolunteerPublic;
  event: EventSummary;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  cancelled_at?: string | null;
  no_show_marked: boolean;
  absence_reason_document?: string | null;
  absence_reason_comment?: string;
  absence_reason_approved?: boolean;
  can_volunteer_cancel?: boolean;
}

export interface Initiative {
  id: number;
  volunteer: VolunteerPublic;
  title: string;
  description: string;
  image?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MeProfileVolunteer {
  id: number;
  skills?: string;
  experience?: string;
  date_of_birth?: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface MeProfileOrganization {
  id: number;
  name: string;
  description?: string;
  logo?: string | null;
  website?: string;
  contact_email?: string;
  address?: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
}

export interface MeResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: UserType;
  phone?: string;
  avatar?: string | null;
  bio?: string;
  city?: string;
  is_verified: boolean;
  created_at: string;
  profile: MeProfileVolunteer | MeProfileOrganization | null;
}
