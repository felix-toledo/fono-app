'use client';

import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import {
  Users,
  BarChart2,
  Calendar,
  MessageSquare,
  ClipboardList,
  FileText,
  Brain,
  Target
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Users,
      title: "Gestión de Pacientes",
      description: "Organizá y mantené un registro detallado de todos tus pacientes y sus historiales clínicos.",
      color: "text-[#F12E47]"
    },
    {
      icon: BarChart2,
      title: "Seguimiento de Progreso",
      description: "Monitoreá el avance de tus pacientes con métricas detalladas y reportes personalizados.",
      color: "text-[#F0B02A]"
    },
    {
      icon: Target,
      title: "Objetivos Terapéuticos",
      description: "Establecé y realizá seguimiento de objetivos específicos para cada paciente.",
      color: "text-[#F78493]"
    },
    {
      icon: ClipboardList,
      title: "Ejercicios Personalizados",
      description: "Creá y asigná ejercicios específicos para que tus pacientes practiquen fuera del consultorio.",
      color: "text-[#CFC643]"
    },
    {
      icon: Calendar,
      title: "Planificación de Sesiones",
      description: "Organizá tus sesiones y mantené un registro de las actividades realizadas.",
      color: "text-[#FAC5C7]"
    },
    {
      icon: Brain,
      title: "Próximamente: IA para Recomendaciones",
      description: "La inteligencia artificial analizará la evolución de tus pacientes y te brindará consejos y recomendaciones personalizadas para optimizá sus tratamientos.",
      color: "text-[#F12E47]"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FAC5C7]/20 to-[#F78493]/20">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-[#F12E47]">FonoLingo</h1>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-[#F0B02A] text-white px-6 py-2 rounded-md hover:bg-[#F0B02A]/90 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-white py-20 overflow-hidden">
          {/* Imagen de fondo */}
          <Image
            src="/foto_principal.png"
            alt="Fondo FonoLingo"
            fill
            className="object-cover object-center pointer-events-none select-none"
            priority
          />
          {/* Contenido */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <div className="bg-black/40 backdrop-blur-sm p-8 rounded-lg shadow-xl">
              <h2 className="text-4xl font-bold mb-4 text-white [text-shadow:_2px_2px_4px_rgba(0_0_0_/_50%)]">Tu Asistente Profesional en Fonoaudiología</h2>
              <p className="text-xl mb-8 text-white [text-shadow:_2px_2px_4px_rgba(0_0_0_/_50%)]">Mejorá el seguimiento de tus pacientes y optimizá sus resultados terapéuticos</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-[#F0B02A] text-white px-6 py-3 rounded-md hover:bg-[#F0B02A]/90 transition-colors font-medium shadow-lg"
                >
                  Comenzá Ahora
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-[#F12E47]">¿Por qué FonoLingo?</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#F12E47]/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#F12E47]" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-[#F12E47]">Para el Fonoaudiólogo</h4>
                      <p className="text-gray-600 mt-2">Mantené el control del progreso de tus pacientes incluso fuera del consultorio. Accedé a su historial, ejercicios y avances en cualquier momento.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#F0B02A]/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-[#F0B02A]" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-[#F0B02A]">Para el Paciente</h4>
                      <p className="text-gray-600 mt-2">Guía clara para continuar con los ejercicios y objetivos terapéuticos en casa, asegurando un progreso constante.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/foto_portada.png"
                  alt="Fonoaudiólogo trabajando con paciente"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-white to-[#FAC5C7]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12 text-[#F12E47]">Herramientas Profesionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-[#F78493]/20">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h4 className="text-xl font-semibold mb-3 text-[#F12E47]">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#F12E47]/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold mb-4 text-[#F12E47]">¿Listo para optimizar tu práctica profesional?</h3>
            <p className="text-xl text-gray-600 mb-8">Únete a nuestra comunidad de profesionales y lleva tu consulta al siguiente nivel. ¡Contáctanos para más información!</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#F0B02A] text-white px-8 py-3 rounded-md hover:bg-[#F0B02A]/90 transition-colors font-medium shadow-lg"
            >
              Comenzá Ahora
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#8B1A2A] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="sm" />
                <h4 className="text-xl font-bold">FonoLingo</h4>
              </div>
              <p className="text-white/80">Tu asistente profesional en fonoaudiología</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-white/80 hover:text-[#F0B02A] transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/about" className="text-white/80 hover:text-[#F0B02A] transition-colors">Acerca de</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-white/80">Universidad de la Cuenca del Plata</p>
              <p className="text-white/80">Desarrollado por Santiago Suarez y Felix Toledo</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>&copy; {new Date().getFullYear()} FonoLingo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
