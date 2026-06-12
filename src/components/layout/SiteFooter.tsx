import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Instagram, Sparkles, Mail } from "lucide-react";
import { Newsletter } from "@/components/Newsletter";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border bg-background mt-24">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-base font-semibold">NextGen Digital</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              We design and build digital products that move companies forward. Strategy, design, and engineering — under one roof.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition" href="#" aria-label="Twitter"><Twitter className="h-4 w-4"/></a>
              <a className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition" href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4"/></a>
              <a className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition" href="#" aria-label="GitHub"><Github className="h-4 w-4"/></a>
              <a className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition" href="#" aria-label="Instagram"><Instagram className="h-4 w-4"/></a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="/portfolio" className="text-muted-foreground hover:text-foreground">Portfolio</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Services</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/services" className="text-muted-foreground hover:text-foreground">Web Development</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-foreground">Mobile Apps</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-foreground">UI/UX Design</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-foreground">AI Integration</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Newsletter</h4>
            <p className="mt-4 text-sm text-muted-foreground">Monthly notes on product, design and engineering.</p>
            <div className="mt-4">
              <Newsletter />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} NextGen Digital Solutions. All rights reserved.</p>
          <a href="mailto:hello@nextgen.digital" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> hello@nextgen.digital
          </a>
        </div>
      </div>
    </footer>
  );
}
