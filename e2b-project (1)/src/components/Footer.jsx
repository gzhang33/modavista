```jsx
import React from 'react';

const FooterLink = ({ href, children }) => (
    <a href={href} className="text-gray-400 hover:text-white transition-colors duration-200">
        {children}
    </a>
);

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
                         <svg width="120" height="30" viewBox="0 0 133 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.5593 0.93222H21.2373L13.1525 15.3559L21.2373 32.1356H11.5593L7.20339 21.8983H7.01695V32.1356H0.644043V0.93222H7.01695V11.4576H7.20339L11.5593 0.93222Z" fill="white"/>
                            <path d="M36.1695 0.93222V32.1356H29.7966V0.93222H36.1695Z" fill="white"/>
                            <path d="M54.2034 0.93222H60.5763V26.4237L60.7627 32.1356H54.0169L53.8305 26.4237V0.93222H54.2034Z" fill="white"/>
                            <path d="M72.339 12.3898L75.1186 0.93222H81.8644L76.2203 19.4407V32.1356H69.8475V19.4407L64.2034 0.93222H70.9492L72.339 12.3898Z" fill="white"/>
                            <path d="M100.847 0.93222H107.22V32.1356H100.847V0.93222Z" fill="white"/>
                            <path d="M123.61 16.4746C123.61 25.322 118.593 33.0678 109.085 33.0678C99.5763 33.0678 94.5593 25.322 94.5593 16.4746C94.5593 7.62713 99.5763 0 109.085 0C118.593 0 123.61 7.62713 123.61 16.4746ZM101.22 16.4746C101.22 21.6102 103.458 26.8475 109.085 26.8475C114.712 26.8475 116.949 21.6102 116.949 16.4746C116.949 11.339 114.712 6.10171 109.085 6.10171C103.458 6.10171 101.22 11.339 101.22 16.4746Z" fill="white"/>
                            <path d="M132.051 0.93222H132.237L128.814 13.5085L132.237 32.1356H126.051L124.458 22.2712H124.271V32.1356H123.61V0.93222H124.271V11.0848H124.458L126.051 0.93222H132.051Z" fill="white"/>
                        </svg>
                        <p className="mt-4 text-gray-400 text-sm">Online School of Design and Technology by Elisava.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Formaciones</h4>
                        <ul className="space-y-2 text-sm">
                            <li><FooterLink href="#">Másters</FooterLink></li>
                            <li><FooterLink href="#">Posgrados</FooterLink></li>
                            <li><FooterLink href="#">Cursos</FooterLink></li>
                            <li><FooterLink href="#">Cápsulas</FooterLink></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Shifta</h4>
                        <ul className="space-y-2 text-sm">
                            <li><FooterLink href="#">Admisiones</FooterLink></li>
                            <li><FooterLink href="#">Metodología</FooterLink></li>
                            <li><FooterLink href="#">Comunidad</FooterLink></li>
                            <li><FooterLink href="#">Contacto</FooterLink></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><FooterLink href="#">Aviso Legal</FooterLink></li>
                            <li><FooterLink href="#">Política de Privacidad</FooterLink></li>
                            <li><FooterLink href="#">Política de Cookies</FooterLink></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold mb-4">Síguenos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><FooterLink href="#">Instagram</FooterLink></li>
                            <li><FooterLink href="#">LinkedIn</FooterLink></li>
                            <li><FooterLink href="#">YouTube</FooterLink></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} SHIFTA by Elisava. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
```