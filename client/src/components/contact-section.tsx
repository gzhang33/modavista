import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";
import { insertInquirySchema } from "@shared/schema";
import { apiPost } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_TYPES } from "@/types";

const contactFormSchema = insertInquirySchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  company: true,
  businessType: true,
  message: true,
}).extend({
  inquiryType: z.literal('general').default('general'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      businessType: '',
      message: '',
      inquiryType: 'general',
    },
  });

  const submitInquiryMutation = useMutation({
    mutationFn: (data: ContactFormData) => apiPost('inquiries.php', data),
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully",
        description: "Thank you for your interest. We'll contact you within 2 days.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitInquiryMutation.mutate(data);
  };

  return (
    <section className="py-16" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-playfair font-semibold text-charcoal mb-4">
            Connect With DreaModa
          </h3>
          <p className="text-xl text-text-grey max-w-2xl mx-auto">
            Discover our exclusive fashion collections. Contact us for inquiries, appointments, or to learn more about our bespoke services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-soft-white border-none shadow-sm">
            <CardContent className="p-8">
              <h4 className="text-2xl font-playfair font-semibold text-charcoal mb-6">
                Request Information
              </h4>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="First Name"
                              {...field}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                              data-testid="input-first-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Last Name"
                              {...field}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                              data-testid="input-last-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Business Email"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Company Name"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                            data-testid="input-company"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent" data-testid="select-business-type">
                              <SelectValue placeholder="Business Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your requirements..."
                            rows={4}
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent resize-none"
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={submitInquiryMutation.isPending}
                    className="w-full bg-accent-gold text-charcoal py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300"
                    data-testid="button-send-inquiry"
                  >
                    {submitInquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-playfair font-semibold text-charcoal mb-6">Get In Touch</h4>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">DreaModa Headquarters</h5>
                    <p className="text-text-grey">
                      Via della Moda, 123<br />
                      20121 Milano, Italia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">Business Inquiries</h5>
                    <p className="text-text-grey">
                      +39 02 1234 5678<br />
                      Mon - Fri, 9:00 AM - 6:00 PM CET
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">Email</h5>
                    <p className="text-text-grey">
                      Hi@DreaModa.store<br />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-charcoal text-white border-none">
              <CardContent className="p-6">
                <h5 className="text-xl font-playfair font-semibold mb-4">Visit Our Atelier</h5>
                <ul className="space-y-2 text-sm">
                  <li>• Private appointments available</li>
                  <li>• Bespoke design consultations</li>
                  <li>• Seasonal collection previews</li>
                  <li>• Made-to-measure services</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
