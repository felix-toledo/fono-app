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
      description: "Organiza y mantén un registro detallado de todos tus pacientes y sus historiales clínicos.",
      color: "text-primary"
    },
    {
      icon: BarChart2,
      title: "Seguimiento de Progreso",
      description: "Monitorea el avance de tus pacientes con métricas detalladas y reportes personalizados.",
      color: "text-secondary"
    },
    {
      icon: Target,
      title: "Objetivos Terapéuticos",
      description: "Establece y realiza seguimiento de objetivos específicos para cada paciente.",
      color: "text-accent"
    },
    {
      icon: ClipboardList,
      title: "Ejercicios Personalizados",
      description: "Crea y asigna ejercicios específicos para que tus pacientes practiquen fuera del consultorio.",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Planificación de Sesiones",
      description: "Organiza tus sesiones y mantén un registro de las actividades realizadas.",
      color: "text-secondary"
    },

    {
      icon: Brain,
      title: "Próximamente: IA para Recomendaciones",
      description: "La inteligencia artificial analizará la evolución de tus pacientes y te brindará consejos y recomendaciones personalizadas para optimizar sus tratamientos.",
      color: "text-gray-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <h1 className="text-2xl font-bold text-gray-800">FonoLingo</h1>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-hover transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20 overflow-hidden">
          {/* Imagen de fondo */}
          <Image
            src="/foto_principal.png"
            alt="Fondo FonoLingo"
            fill
            className="object-cover object-center opacity-80 pointer-events-none select-none"
            priority
          />
          {/* Overlay para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-60"></div>
          {/* Contenido */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h2 className="text-4xl font-bold mb-4">Tu Asistente Profesional en Fonoaudiología</h2>
            <p className="text-xl mb-8">Optimiza el seguimiento de tus pacientes y mejora sus resultados terapéuticos</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="bg-white text-primary px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                Comenzar Ahora
              </button>
            </div>
          </div>
        </section>

        {/* Problem Statement Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-gray-800">¿Por qué FonoLingo?</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">Para el Fonoaudiólogo</h4>
                      <p className="text-gray-600 mt-2">Mantén el control del progreso de tus pacientes incluso fuera del consultorio. Accede a su historial, ejercicios y avances en cualquier momento.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-gray-800">Para el Paciente</h4>
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Herramientas Profesionales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-accent/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold mb-4 text-gray-800">¿Listo para optimizar tu práctica profesional?</h3>
            <p className="text-xl text-gray-600 mb-8">Únete a nuestra comunidad de profesionales y lleva tu consulta al siguiente nivel. ¡Contáctanos para más información!</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="sm" />
                <h4 className="text-xl font-bold">FonoLingo</h4>
              </div>
              <p className="text-gray-400">Tu asistente profesional en fonoaudiología</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Acerca de</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">Universidad de la Cuenca del Plata</p>
              <p className="text-gray-400">Desarrollado por Santiago Suarez y Felix Toledo</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} FonoLingo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
