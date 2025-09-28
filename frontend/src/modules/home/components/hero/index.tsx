"use client"

import { 
  HiShoppingCart, 
  HiUserGroup, 
  HiDocumentText, 
  HiCreditCard, 
  HiClipboardList, 
  HiShieldCheck 
} from "react-icons/hi"
import { Heading, Button, Badge } from "@medusajs/ui"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

const Hero = () => {
  const gridRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
    life: number
    color: string
  }>>([])

  // Mouse following grid effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return
      
      const rect = gridRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      gridRef.current.style.maskImage = `radial-gradient(circle at ${x}% ${y}%, black 20%, transparent 60%)`
      gridRef.current.style.webkitMaskImage = `radial-gradient(circle at ${x}% ${y}%, black 20%, transparent 60%)`
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Dynamic particle system
  useEffect(() => {
    const createParticle = () => {
      if (!containerRef.current) return null
      
      const rect = containerRef.current.getBoundingClientRect()
      return {
        id: Math.random(),
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        life: Math.random() * 5000 + 3000,
        color: Math.random() > 0.5 ? 'bg-accent' : 'bg-background-secondary'
      }
    }

    const updateParticles = () => {
      setParticles(prev => {
        const updated = prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 16
          }))
          .filter(particle => particle.life > 0 && 
            particle.x > -50 && particle.x < (containerRef.current?.clientWidth || 0) + 50 &&
            particle.y > -50 && particle.y < (containerRef.current?.clientHeight || 0) + 50
          )

        // Add new particles randomly
        if (Math.random() < 0.1 && updated.length < 20) {
          const newParticle = createParticle()
          if (newParticle) updated.push(newParticle)
        }

        return updated
      })
    }

    const interval = setInterval(updateParticles, 16) // 60fps
    
    // Initialize with some particles
    const initialParticles = Array.from({ length: 8 }, () => createParticle()).filter(Boolean)
    setParticles(initialParticles as any)

    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in-up pt-16 sm:pt-20">
        {/* Badge */}
        <Badge 
          size="base" 
          variant="secondary" 
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-accent border border-accent bg-transparent text-sm font-medium tracking-wider uppercase animate-pulse-glow"
        >
          B2B Platform
        </Badge>

        {/* Main Heading */}
        <div className="mb-8">
          <div className="mb-6">
            <Heading 
              level="h1" 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-2"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Pharmint
            </Heading>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-accent tracking-wide">
              Your trusted pharma partner
            </p>
          </div>

          <p className="text-lg sm:text-xl text-pharmint-muted max-w-2xl mx-auto leading-relaxed">
            Streamline your pharmaceutical procurement with our comprehensive B2B platform. 
            Connect suppliers, manage quotes, and scale your business efficiently.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/store">
            <Button 
              size="large" 
              className="bg-accent hover:bg-accent-hover text-white px-8 py-4 text-lg font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-accent/25 w-full sm:w-auto"
            >
              <HiShoppingCart className="mr-2 w-5 h-5" />
              Browse Products
            </Button>
          </Link>
          
          <Link href="/account">
            <Button 
              size="large" 
              variant="secondary" 
              className="border border-pharmint-border bg-background-secondary text-white hover:bg-pharmint-border/20 px-8 py-4 text-lg font-semibold transition-all duration-200 w-full sm:w-auto"
            >
              <HiUserGroup className="mr-2 w-5 h-5" />
              Create Account
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-16 pb-8">
          {[
            {
              icon: <HiShoppingCart className="w-8 h-8 text-accent" />,
              title: "Bulk Procurement",
              description: "Order pharmaceutical products in bulk with competitive pricing and streamlined processes"
            },
            {
              icon: <HiDocumentText className="w-8 h-8 text-accent" />,
              title: "Custom Quotes",
              description: "Request tailored quotes for specific needs and manage negotiations seamlessly"
            },
            {
              icon: <HiUserGroup className="w-8 h-8 text-accent" />,
              title: "Team Management",
              description: "Control user permissions, spending limits, and approval workflows for your organization"
            },
            {
              icon: <HiCreditCard className="w-8 h-8 text-accent" />,
              title: "Flexible Payment",
              description: "Multiple payment options with credit terms and automated billing for business customers"
            },
            {
              icon: <HiClipboardList className="w-8 h-8 text-accent" />,
              title: "Order Tracking",
              description: "Real-time visibility into your orders from placement to delivery with detailed reporting"
            },
            {
              icon: <HiShieldCheck className="w-8 h-8 text-accent" />,
              title: "Compliance Ready",
              description: "Full regulatory compliance and documentation for pharmaceutical supply chain requirements"
            }
          ].map((feature, index) => (
            <div key={index} className="group p-6 rounded-lg bg-background-secondary border border-pharmint-border hover:border-accent/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-pharmint-muted text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive grid pattern */}
      <div 
        ref={gridRef}
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 60%)'
        }}
      />

      {/* Dynamic particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color} transition-opacity duration-300`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity * (particle.life / 5000),
              transform: `translate(-50%, -50%)`
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
