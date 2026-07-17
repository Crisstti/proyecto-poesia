import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Feather } from 'lucide-react';

export const Policies: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black">

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/register');
            }
          }}
          className="flex items-center gap-2 text-white/70 hover:text-white transition mb-8"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="text-center mb-12">
          <Feather className="mx-auto text-primary mb-4" size={40} />
          <h1 className="text-4xl font-bold text-white mb-3">
            Políticas de Poesia
          </h1>
          <p className="text-gray-400 italic">
            "Las palabras tienen poder. Úsalas con responsabilidad."
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">

        {/* Políticas de Uso */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            📜 Políticas de Uso
          </h2>
          <p className="text-primary text-sm italic mb-6">
            Última actualización: 2026
          </p>

          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                1. Propósito de la plataforma
              </h3>
              <p className="leading-relaxed">
                Poesia es un espacio creativo dedicado a la escritura, publicación
                y difusión de poesías. La plataforma está diseñada para fomentar
                la expresión artística, el respeto mutuo y la construcción de una
                comunidad literaria positiva e inclusiva.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                2. Contenido prohibido
              </h3>
              <p className="leading-relaxed mb-3">
                Queda estrictamente prohibido publicar contenido que:
              </p>
              <ul className="space-y-2 ml-4">
                {[
                  'Contenga discurso de odio, discriminación o incitación a la violencia por razones de raza, género, orientación sexual, religión, nacionalidad o cualquier otra condición.',
                  'Sea de naturaleza sexual explícita, especialmente si involucra menores de edad.',
                  'Acose, intimide o amenace a otros usuarios o personas.',
                  'Constituya spam, publicidad no autorizada o contenido repetitivo sin valor creativo.',
                  'Infrinja derechos de autor o propiedad intelectual de terceros.',
                  'Difunda información falsa con intención de engañar o perjudicar.',
                  'Promueva actividades ilegales o sea contrario a la legislación colombiana e internacional aplicable.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                3. Consecuencias del incumplimiento
              </h3>
              <p className="leading-relaxed">
                El incumplimiento de estas políticas puede resultar en la eliminación
                del contenido infractor, la suspensión temporal o la eliminación
                permanente de la cuenta del usuario, sin previo aviso en casos de
                gravedad extrema. El equipo de administración revisará los reportes
                recibidos y tomará las medidas correspondientes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                4. Sistema de reportes
              </h3>
              <p className="leading-relaxed">
                Cualquier usuario puede reportar contenido que considere que viola
                estas políticas usando el botón "Reportar" disponible en cada poesía.
                Los reportes son confidenciales y serán revisados por el equipo
                administrador. El abuso del sistema de reportes también es motivo
                de sanción.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                5. Propiedad del contenido
              </h3>
              <p className="leading-relaxed">
                El contenido que publicas en Poesia es tuyo. Al publicarlo, nos
                otorgas una licencia no exclusiva para mostrarlo dentro de la
                plataforma. No vendemos ni transferimos tu contenido a terceros.
                Puedes eliminar tu contenido en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        {/* Política de Privacidad */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            🔒 Política de Privacidad
          </h2>
          <p className="text-primary text-sm italic mb-6">
            Última actualización: 2026
          </p>

          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                1. Datos que recopilamos
              </h3>
              <p className="leading-relaxed mb-3">
                Recopilamos únicamente los datos necesarios para el funcionamiento
                de la plataforma:
              </p>
              <ul className="space-y-2 ml-4">
                {[
                  'Nombre y dirección de correo electrónico (al registrarte).',
                  'Contenido que publicas: poesías, comentarios y mensajes.',
                  'Interacciones: likes, favoritos y relaciones de amistad.',
                  'Datos técnicos básicos de sesión para garantizar la seguridad de tu cuenta.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                2. Uso de tus datos
              </h3>
              <p className="leading-relaxed">
                Tus datos se utilizan exclusivamente para:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                {[
                  'Gestionar tu cuenta y permitirte acceder a la plataforma.',
                  'Mostrar tu contenido a la comunidad cuando decides publicarlo.',
                  'Facilitar la comunicación entre usuarios (mensajes, comentarios).',
                  'Mejorar la experiencia de uso de la plataforma.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                3. No vendemos tus datos
              </h3>
              <p className="leading-relaxed">
                Poesia no vende, alquila ni comparte tus datos personales con
                terceros con fines comerciales. Tus datos son tuyos y los tratamos
                con absoluta confidencialidad.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                4. Tus derechos sobre tus datos
              </h3>
              <p className="leading-relaxed mb-3">
                De acuerdo con la legislación colombiana (Ley 1581 de 2012) y el
                Reglamento General de Protección de Datos (RGPD) donde aplique,
                tienes derecho a:
              </p>
              <ul className="space-y-2 ml-4">
                {[
                  'Acceder a tus datos personales en cualquier momento.',
                  'Corregir datos inexactos o incompletos desde tu perfil.',
                  'Eliminar tu cuenta y todos tus datos de manera permanente e irreversible desde Configuración.',
                  'Solicitar información sobre el tratamiento de tus datos.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                5. Eliminación de cuenta y datos
              </h3>
              <p className="leading-relaxed">
                Al eliminar tu cuenta desde Configuración, todos tus datos
                personales, poesías, comentarios, mensajes, likes y favoritos
                serán eliminados de forma permanente e irreversible de nuestra
                base de datos. Esta acción no puede deshacerse.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                6. Seguridad
              </h3>
              <p className="leading-relaxed">
                Implementamos medidas técnicas y organizativas para proteger tus
                datos contra accesos no autorizados, pérdida o alteración. Sin
                embargo, ningún sistema es completamente infalible, por lo que
                te recomendamos usar una contraseña segura y no compartirla.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                7. Contacto
              </h3>
              <p className="leading-relaxed">
                Si tienes preguntas sobre el tratamiento de tus datos o deseas
                ejercer alguno de tus derechos, puedes contactarnos a través de
                la plataforma. Atenderemos tu solicitud en un plazo máximo de
                15 días hábiles.
              </p>
            </div>
          </div>
        </div>

        {/* Footer poético */}
        <div className="text-center py-8">
          <p className="text-gray-500 italic text-sm">
            "Un poema es un contrato entre el escritor y el lector,<br />
            construido sobre la confianza."
          </p>
          <p className="text-gray-600 text-xs mt-4">
            Poesia ✦ Palabras en Poemas
          </p>
        </div>
      </div>
    </div>
  );
};
