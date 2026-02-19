import apiService from './apiService';

export interface Publication {
    id: number;
    title: string;
    slug: string;
    type: string;
    abstract: string;
    year: number;
    language: string;
    country: string;
    province?: string;
    authors: { id: number; name: string; slug: string }[];
    institution?: { id: number; name: string; country: string };
    cover_image?: string;
    pdf_file: string;
    access_level: 'OPEN' | 'REGISTERED' | 'RESTRICTED';
    views_count: number;
    downloads_count: number;
    is_verified: boolean;
    keywords: string[];
    doi_internal: string;
    created_at: string;
}

const libraryService = {
    getPublications: async (params?: any) => {
        const response = await apiService.get('/library/publications/', { params });
        return response.data;
    },

    getPublication: async (slug: string) => {
        const response = await apiService.get(`/library/publications/${slug}/`);
        return response.data;
    },

    recordView: async (slug: string) => {
        return await apiService.post(`/library/publications/${slug}/view/`, {});
    },

    recordDownload: async (slug: string) => {
        const response = await apiService.post(`/library/publications/${slug}/download/`, {});
        return response.data; // contains download_url
    }
};

export default libraryService;
