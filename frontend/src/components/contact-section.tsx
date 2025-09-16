import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, MessageCircle, Mail, CheckCircle } from "lucide-react";
import { insertInquirySchema } from "@shared/schemas/schema";
import { apiPost } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  inquiryType: z.literal('general').default('general'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, currentLanguage } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // 生成谷歌地图链接的函数
  const getGoogleMapsLink = () => {
    const address = "Via Gherardacci 47/C, Iolo, Prato, Toscana, Italia";
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      message: '',
      inquiryType: 'general',
    },
  });

  const submitInquiryMutation = useMutation({
    mutationFn: (data: ContactFormData) => apiPost('inquiries.php', data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: t('errors.contact.submit_success', 'Message sent successfully! We will contact you soon.'),
        description: t('errors.contact.success_description', 'Thank you for your interest. We\'ll contact you within 24 hours.'),
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      
      // 5秒后重置成功状态
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <Card className="bg-soft-white border-none shadow-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h4 className="text-2xl font-playfair font-semibold text-charcoal mb-6">
                {t('home.contact.form.title')}
              </h4>
              
              {/* Success Message */}
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="text-green-600 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-semibold">
                      {t('errors.contact.submit_success', 'Message sent successfully! We will contact you soon.')}
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      {t('errors.contact.success_description', 'Thank you for your interest. We\'ll contact you within 24 hours.')}
                    </p>
                  </div>
                </div>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={t('home.contact.form.first_name')}
                              {...field}
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent min-h-[44px] text-base"
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
                              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent min-h-[44px] text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent min-h-[44px] text-base"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent min-h-[44px] text-base"
                            data-testid="input-company"
                          />
                        </FormControl>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent resize-none text-base"
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
                    className="w-full bg-accent-gold text-charcoal py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300 min-h-[44px]"
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
                  <MessageCircle className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">{t('home.contact.info.inquiries')}</h5>
                    <div className="text-text-grey">
                      <a 
                        href="https://wa.me/393888518810" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-text-grey hover:text-accent-gold transition-colors duration-300 underline block mb-2"
                        onClick={(e) => {
                          // 构造自动发送的消息（根据当前语言）
                          const defaultMessage = currentLanguage === 'it' 
                            ? "Sono interessato al vostro business di abbigliamento all'ingrosso. Posso avere ulteriori dettagli?"
                            : "I'm interested in your wholesale clothing business. May I have further details?";
                          const message = encodeURIComponent(t('home.contact.auto_message') || defaultMessage);
                          const whatsappUrl = `https://wa.me/393388508068?text=${message}`;
                          e.currentTarget.href = whatsappUrl;
                        }}
                      >
                        WhatsApp: +39 3388508068
                      </a>
                      <span className="whitespace-pre-line">
                        {t('home.contact.info.phone_hours')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="text-accent-gold text-xl mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-charcoal mb-1">{t('home.contact.info.email')}</h5>
                    <p className="text-text-grey">
                      <a 
                        href="mailto:Hi@DreamModa.store" 
                        className="text-text-grey hover:text-accent-gold transition-colors duration-300 underline"
                      >
                        {t('home.contact.info.email_address')}
                      </a>
                      <br />
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
