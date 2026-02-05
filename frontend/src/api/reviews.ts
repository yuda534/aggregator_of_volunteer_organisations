import api from './client';
import type { OrganizationReview, VolunteerReview } from './types';

export interface VolunteerReviewPayload {
  volunteer: number;
  event: number;
  rating: number;
  positive_comment?: string;
  negative_comment?: string;
  improvement_comment?: string;
}

export interface OrganizationReviewPayload {
  organization: number;
  event: number;
  rating: number;
  positive_comment?: string;
  negative_comment?: string;
  improvement_comment?: string;
}

export async function createVolunteerReview(payload: VolunteerReviewPayload) {
  const response = await api.post<VolunteerReview>('/reviews/volunteers/', payload);
  return response.data;
}

export async function createOrganizationReview(payload: OrganizationReviewPayload) {
  const response = await api.post<OrganizationReview>('/reviews/organizations/', payload);
  return response.data;
}

export async function getVolunteerReviews(params: { volunteer?: number; organization?: number } = {}) {
  const response = await api.get<VolunteerReview[]>('/reviews/volunteers/', { params });
  return response.data;
}

export async function getOrganizationReviews(params: { organization?: number; volunteer?: number } = {}) {
  const response = await api.get<OrganizationReview[]>('/reviews/organizations/', { params });
  return response.data;
}
