import type { ReactNode } from 'react';
import { useToast } from './ToastProvider';

interface Props {
 phone: string;
 label: string;
 className?: string;
 children: ReactNode;
}

const isMobile = () =>
 /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const isVerified = (phone: string) => !phone.startsWith('VERIFY_');

export function PhoneLink({ phone, label, className, children }: Props) {
 const { showPhone } = useToast();

 if (!isVerified(phone)) {
  return (
   <span
    className={`${className ?? ''} opacity-50 cursor-not-allowed select-none`}
    title="Number not yet verified — check official sources"
    aria-label={`${label}: number not yet verified`}
    aria-disabled="true"
   >
    {children}
   </span>
  );
 }

 const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  if (!isMobile()) {
   e.preventDefault();
   showPhone(phone, label);
  }
  // on mobile: let tel: proceed normally
 };

 return (
  <a
   href={`tel:${phone}`}
   onClick={handleClick}
   className={className}
   aria-label={`${label}: ${phone}`}
  >
   {children}
  </a>
 );
}
