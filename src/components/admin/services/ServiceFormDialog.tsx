
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Service, NewService, useAddService, useUpdateService } from "@/hooks/useManagedServices";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as LucideIcons from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  category: z.string().min(1, "Category is required"),
  pricing: z.string().nullable(),
  duration: z.string().nullable(),
  features: z.string().transform(val => val.split(',').map(item => item.trim()).filter(Boolean)),
  icon_name: z.string().nullable(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormDialogProps {
  service?: Service;
  children: React.ReactNode;
}

const iconNames = Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key) && key !== 'createLucideIcon' && key !== 'icons');

export const ServiceFormDialog = ({ service, children }: ServiceFormDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const addServiceMutation = useAddService();
  const updateServiceMutation = useUpdateService();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      pricing: "",
      duration: "",
      features: "",
      icon_name: "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: service?.name || "",
        description: service?.description || "",
        category: service?.category || "",
        pricing: service?.pricing || "",
        duration: service?.duration || "",
        features: service?.features?.join(', ') || "",
        icon_name: service?.icon_name || "",
      });
    }
  }, [isOpen, service, reset]);

  const onSubmit = (data: ServiceFormValues) => {
    const serviceData = {
        ...data,
        features: data.features as string[],
    };
    if (service) {
      updateServiceMutation.mutate({ ...serviceData, id: service.id });
    } else {
      addServiceMutation.mutate(serviceData as NewService);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update the details of the service." : "Fill in the details for the new service."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-red-500 text-sm text-right">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" {...register("description")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" {...register("category")} className="col-span-3" />
              {errors.category && <p className="col-span-4 text-red-500 text-sm text-right">{errors.category.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricing" className="text-right">Pricing</Label>
              <Input id="pricing" {...register("pricing")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Duration</Label>
              <Input id="duration" {...register("duration")} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="features" className="text-right">Features</Label>
              <Input id="features" {...register("features")} className="col-span-3" placeholder="Feature1, Feature2, ..." />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon_name" className="text-right">Icon</Label>
               <Controller
                control={control}
                name="icon_name"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconNames.map(iconName => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={addServiceMutation.isPending || updateServiceMutation.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
