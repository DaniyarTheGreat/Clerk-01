'use client'

import { useLanguage } from '../lib/language-context'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-emerald-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📖</span>
              <span className="font-amiri text-xl font-bold">Quran Academy</span>
            </div>
            <p className="text-emerald-200 text-sm leading-relaxed">
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footer.product.title}</h4>
            <ul className="space-y-2 text-sm text-emerald-200">
              <li><a href="#" className="hover:text-white transition">{t.footer.product.links.features}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.product.links.pricing}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.product.links.courses}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.product.links.teachers}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footer.company.title}</h4>
            <ul className="space-y-2 text-sm text-emerald-200">
              <li><a href="#" className="hover:text-white transition">{t.footer.company.links.about}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.company.links.careers}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.company.links.blog}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.company.links.press}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footer.support.title}</h4>
            <ul className="space-y-2 text-sm text-emerald-200">
              <li><a href="#" className="hover:text-white transition">{t.footer.support.links.help}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.support.links.contact}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.support.links.privacy}</a></li>
              <li><a href="#" className="hover:text-white transition">{t.footer.support.links.terms}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-emerald-800 mt-12 pt-8 text-center text-sm text-emerald-300">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}

