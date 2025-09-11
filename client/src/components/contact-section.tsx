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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  // 生成谷歌地图链接的函数
  const getGoogleMapsLink = () => {
    const address = "Via Gherardacci 47/C, Iolo, Prato, Toscana, Italia";
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

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
        title: t('errors.contact.submit_success', 'Message sent successfully! We will contact you soon.'),
        description: t('contact.success_description', 'Thank you for your interest. We\'ll contact you within 2 days.'),
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
    },
    onError: () => {
      toast({
        title: t('errors.contact.submit_failed', 'Failed to send message. Please try again or contact us directly.'),
        description: t('errors.general.message', 'An unexpected error occurred. Please try again.'),
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
            {t('home.contact.title')}
          </h3>
          <p className="text-xl text-text-grey max-w-2xl mx-auto">
            {t('home.contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-soft-white border-none shadow-sm">
            <CardContent className="p-8">
              <h4 className="text-2xl font-playfair font-semibold text-charcoal mb-6">
                {t('home.contact.form.title')}
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
                              placeholder={t('home.contact.form.first_name')}
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
                              placeholder={t('home.contact.form.last_name')}
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
                            placeholder={t('home.contact.form.email')}
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
                            placeholder={t('home.contact.form.company')}
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
                              <SelectValue placeholder={t('home.contact.form.business_type')} />
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
                            placeholder={t('home.contact.form.requirements')}
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
                    {submitInquiryMutation.isPending ? t('common.loading') : t('home.contact.form.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-playfair font-semibold text-charcoal mb-6">{t('home.contact.info.title')}</h4>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">{t('home.contact.info.headquarters')}</h5>
                    <a 
                      href={getGoogleMapsLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-grey hover:text-accent-gold transition-colors duration-300 cursor-pointer underline decoration-dotted underline-offset-2"
                      title="Click to view on Google Maps"
                    >
                      {t('home.contact.info.address')}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">{t('home.contact.info.inquiries')}</h5>
                    <p className="text-text-grey">
                      {t('home.contact.info.phone')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">{t('home.contact.info.email')}</h5>
                    <p className="text-text-grey">
                      {t('home.contact.info.email_address')}<br />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-charcoal text-white border-none">
              <CardContent className="p-6">
                <h5 className="text-xl font-playfair font-semibold mb-4">{t('home.contact.visit.title')}</h5>
                <ul className="space-y-2 text-sm">
                  <li>• {t('home.contact.visit.appointments')}</li>
                  <li>• {t('home.contact.visit.consultations')}</li>
                  <li>• {t('home.contact.visit.previews')}</li>
                  <li>• {t('home.contact.visit.services')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
