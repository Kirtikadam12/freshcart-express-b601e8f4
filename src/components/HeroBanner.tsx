import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-produce.jpg";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Content */}
          <div className="flex-1 space-y-6 text-center md:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-2xl animate-bounce-soft">🌿</span>
              <span className="text-sm font-semibold text-primary">100% Organic & Fresh</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Fresh Vegetables & Fruits
              <span className="block text-primary">Delivered Fast!</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
              Get farm-fresh produce delivered to your doorstep in just 10-15 minutes. 
              Quality guaranteed!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button variant="fresh" size="lg" className="text-base px-8">
                Shop Now
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8">
                View Offers
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 justify-center md:justify-start pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">10k+</p>
                <p className="text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">10 min</p>
                <p className="text-xs text-muted-foreground">Delivery</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated animate-scale-in">
              <img
                src={heroImage}
                alt="Fresh vegetables and fruits arrangement"
                className="w-full h-auto object-cover"
              />
              {/* Floating discount badge */}
              <div className="absolute top-4 right-4 bg-citrus-orange text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg animate-float">
                Up to 30% OFF
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/30 rounded-full blur-3xl" />
    </section>
  );
}
