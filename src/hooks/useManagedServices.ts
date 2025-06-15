
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from "@/components/ui/use-toast";

export type Service = Tables<'managed_services'>;
export type NewService = TablesInsert<'managed_services'>;
export type UpdatedService = TablesUpdate<'managed_services'>;

// Fetch all services
const fetchServices = async () => {
  const { data, error } = await supabase.from('managed_services').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const useManagedServices = () => {
  return useQuery({
    queryKey: ['managed_services'],
    queryFn: fetchServices,
  });
};

// Add a new service
const addService = async (service: NewService) => {
  const { data, error } = await supabase.from('managed_services').insert(service).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const useAddService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_services'] });
      toast({ title: "Success", description: "Service added successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Update a service
const updateService = async (service: UpdatedService) => {
  if (!service.id) throw new Error("Service ID is required for update.");
  const { data, error } = await supabase.from('managed_services').update(service).eq('id', service.id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_services'] });
      toast({ title: "Success", description: "Service updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Delete a service
const deleteService = async (id: string) => {
  const { error } = await supabase.from('managed_services').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return id;
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_services'] });
      toast({ title: "Success", description: "Service deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
