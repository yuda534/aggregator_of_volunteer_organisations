import api from './client';

export interface VolunteerReviewPayload {
  volunteer: number;
  event: number;
  rating: number;
  positive_comment?: string;
  negative_comment?: string;
}

export interface OrganizationReviewPayload {
  organization: number;
  event: number;
  rating: number;
  positive_comment?: string;
  negative_comment?: string;
}

export async function createVolunteerReview(payload: VolunteerReviewPayload) {
  const response = await api.post('/reviews/volunteers/', payload);
  return response.data;
}

export async function createOrganizationReview(payload: OrganizationReviewPayload) {
  const response = await api.post('/reviews/organizations/', payload);
  return response.data;
}
