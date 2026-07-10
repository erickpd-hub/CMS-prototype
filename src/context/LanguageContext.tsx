import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key: string) => key,
});

const dictionary: Record<string, Record<Language, string>> = {
  // Sidebar / Header
  'Dashboard': { en: 'Dashboard', es: 'Panel Principal' },
  'Campaigns': { en: 'Campaigns', es: 'Campañas' },
  'Post Scheduler': { en: 'Post Scheduler', es: 'Programador' },
  'Analytics': { en: 'Analytics', es: 'Analíticas' },
  'Integrations': { en: 'Integrations', es: 'Integraciones' },
  'Profile': { en: 'Profile', es: 'Perfil' },
  
  // AEO
  'AEO Optimization': { en: 'AEO Optimization', es: 'Optimización AEO' },
  'Optimize your content for AI Search Engines (ChatGPT, Gemini, Perplexity).': { en: 'Optimize your content for AI Search Engines (ChatGPT, Gemini, Perplexity).', es: 'Optimiza tu contenido para Motores de Búsqueda de IA (ChatGPT, Gemini, Perplexity).' },
  'Website Not Connected': { en: 'Website Not Connected', es: 'Sitio Web no Conectado' },
  'To use the AI Engine Optimization (AEO) module, you must first connect your website or analytics data source.': { en: 'To use the AI Engine Optimization (AEO) module, you must first connect your website or analytics data source.', es: 'Para usar el módulo de Optimización de Motores de IA (AEO), primero debes conectar tu sitio web o fuente de analíticas.' },
  'Connect Website': { en: 'Connect Website', es: 'Conectar Sitio Web' },
  'Connect Test Website': { en: 'Connect Test Website', es: 'Conectar Sitio Web de Prueba' },
  'Test website connected successfully!': { en: 'Test website connected successfully!', es: '¡Sitio web de prueba conectado exitosamente!' },
  'Failed to connect test website.': { en: 'Failed to connect test website.', es: 'Error al conectar el sitio web de prueba.' },
  'New Analysis': { en: 'New Analysis', es: 'Nuevo Análisis' },
  'Target URL': { en: 'Target URL', es: 'URL Objetivo' },
  'Target Keyword / Entity': { en: 'Target Keyword / Entity', es: 'Palabra Clave / Entidad Objetivo' },
  'Analyzing...': { en: 'Analyzing...', es: 'Analizando...' },
  'Generate Insights': { en: 'Generate Insights', es: 'Generar Insights' },
  'AEO Score': { en: 'AEO Score', es: 'Puntuación AEO' },
  'AI Readability': { en: 'AI Readability', es: 'Legibilidad de IA' },
  'Entity Clarity': { en: 'Entity Clarity', es: 'Claridad de Entidades' },
  'AI Engine Recommendations': { en: 'AI Engine Recommendations', es: 'Recomendaciones de Motor de IA' },
  'Enter a URL and target keyword to generate AI Engine Optimization insights.': { en: 'Enter a URL and target keyword to generate AI Engine Optimization insights.', es: 'Ingresa una URL y palabra clave objetivo para generar insights de Optimización para Motores de IA.' },
  'Structure content with clear H2/H3 headings for AI parsers.': { en: 'Structure content with clear H2/H3 headings for AI parsers.', es: 'Estructura el contenido con encabezados claros H2/H3 para los analizadores de IA.' },
  'Include direct, concise answers to common questions at the top.': { en: 'Include direct, concise answers to common questions at the top.', es: 'Incluye respuestas directas y concisas a preguntas comunes en la parte superior.' },
  'Use structured data (JSON-LD) to define key entities.': { en: 'Use structured data (JSON-LD) to define key entities.', es: 'Usa datos estructurados (JSON-LD) para definir entidades clave.' },
  'Improve keyword density organically without stuffing.': { en: 'Improve keyword density organically without stuffing.', es: 'Mejora la densidad de palabras clave orgánicamente sin saturación.' },
  'AEO Analysis complete.': { en: 'AEO Analysis complete.', es: 'Análisis AEO completado.' },
  
  'Good': { en: 'Good', es: 'Bueno' },
  'Needs Improvement': { en: 'Needs Improvement', es: 'Necesita Mejorar' },
  
  // Dashboard
  'Total Spend': { en: 'Total Spend', es: 'Gasto Total' },
  'Active Campaigns': { en: 'Active Campaigns', es: 'Campañas Activas' },
  'Total Engagement': { en: 'Total Engagement', es: 'Interacciones' },
  'Total Reach': { en: 'Total Reach', es: 'Alcance Total' },
  'Engagement Rate': { en: 'Engagement Rate', es: 'Tasa de Interacción' },
  'Total Conversions': { en: 'Total Conversions', es: 'Conversiones Totales' },
  'Quick Actions': { en: 'Quick Actions', es: 'Acciones Rápidas' },
  'Upcoming Posts': { en: 'Upcoming Posts', es: 'Próximos Posts' },
  'New Post': { en: 'New Post', es: 'Nuevo Post' },
  'Reports': { en: 'Reports', es: 'Reportes' },
  'from last week': { en: 'from last week', es: 'desde la semana pasada' },
  'Reach vs Engagement': { en: 'Reach vs Engagement', es: 'Alcance vs Interacción' },
  'Last 7 days': { en: 'Last 7 days', es: 'Últimos 7 días' },
  'Last 30 days': { en: 'Last 30 days', es: 'Últimos 30 días' },
  'This Year': { en: 'This Year', es: 'Este Año' },
  
  // Campaigns
  'AI Campaign Manager': { en: 'AI Campaign Manager', es: 'Gestor IA de Campañas' },
  'Apply AI Recommendations': { en: 'Apply AI Recommendations', es: 'Aplicar Recomendaciones IA' },
  'Review Rules': { en: 'Review Rules', es: 'Revisar Reglas' },
  'Pause': { en: 'Pause', es: 'Pausar' },
  'Resume': { en: 'Resume', es: 'Reanudar' },
  'Search campaigns...': { en: 'Search campaigns...', es: 'Buscar campañas...' },
  'All Channels': { en: 'All Channels', es: 'Todos los canales' },
  'Active Only': { en: 'Active Only', es: 'Solo activas' },
  'Active': { en: 'Active', es: 'Activa' },
  'Paused': { en: 'Paused', es: 'Pausada' },
  'Performance': { en: 'Performance', es: 'Rendimiento' },
  'Spend': { en: 'Spend', es: 'Gasto' },
  'ROAS': { en: 'ROAS', es: 'ROAS' },
  'Targeting': { en: 'Targeting', es: 'Público Objetivo' },
  'Smart Budget Allocation applied': { en: 'Smart Budget Allocation applied', es: 'Asignación de presupuesto inteligente aplicada' },
  'AI has auto-paused 1 underperforming campaign and suggests budget re-allocation for Meta ads to maximize ROAS based on current ecommerce trends.': { en: 'AI has auto-paused 1 underperforming campaign and suggests budget re-allocation for Meta ads to maximize ROAS based on current ecommerce trends.', es: 'La IA ha auto-pausado 1 campaña de bajo rendimiento y sugiere reasignar el presupuesto de anuncios de Meta para maximizar el ROAS basado en las tendencias actuales de ecommerce.' },
  'Applied AI recommendations to Meta Retargeting.': { en: 'Applied AI recommendations to Meta Retargeting.', es: 'Recomendaciones de IA aplicadas a Retargeting en Meta.' },
  'Increase budget by 15% to capture peak evening traffic.': { en: 'Increase budget by 15% to capture peak evening traffic.', es: 'Aumentar presupuesto un 15% para capturar el tráfico pico nocturno.' },
  'Optimal performance. AI bidding is maintaining target CPA.': { en: 'Optimal performance. AI bidding is maintaining target CPA.', es: 'Rendimiento óptimo. Las pujas por IA mantienen el CPA objetivo.' },
  'Paused by AI. Creative fatigue detected after 4 days. Regenerate creatives.': { en: 'Paused by AI. Creative fatigue detected after 4 days. Regenerate creatives.', es: 'Pausada por IA. Fatiga creativa detectada después de 4 días. Generar nuevas creatividades.' },
  
  // Analytics
  'Ecommerce Leads & Conversions': { en: 'Ecommerce Leads & Conversions', es: 'Leads y Conversiones Ecommerce' },
  'Lead generation over time': { en: 'Lead generation over time', es: 'Generación de leads en el tiempo' },
  'Active Users Heatmap': { en: 'Active Users Heatmap', es: 'Mapa de Calor de Usuarios' },
  'Platform Performance (Ads & Social)': { en: 'Platform Performance (Ads & Social)', es: 'Rendimiento (Ads y Social)' },
  'Export Report': { en: 'Export Report', es: 'Exportar Reporte' },
  'Revenue': { en: 'Revenue', es: 'Ingresos' },
  'Leads': { en: 'Leads', es: 'Clientes Potenciales' },
  'Total Leads (New)': { en: 'Total Leads (New)', es: 'Nuevos Leads' },
  'Add to Cart': { en: 'Add to Cart', es: 'Añadir al Carrito' },
  'Checkout Conversions': { en: 'Checkout Conversions', es: 'Conversiones de Checkout' },
  'Total Revenue': { en: 'Total Revenue', es: 'Ingresos Totales' },
  'New Leads': { en: 'New Leads', es: 'Nuevos Leads' },
  'Converted Customers': { en: 'Converted Customers', es: 'Clientes Convertidos' },
  'Visitor concentration by day & time': { en: 'Visitor concentration by day & time', es: 'Concentración de visitantes por día y hora' },
  'Low': { en: 'Low', es: 'Bajo' },
  'High Traffic': { en: 'High Traffic', es: 'Tráfico Alto' },
  'Engagement Score': { en: 'Engagement Score', es: 'Puntaje de Interacción' },
  'Ad Conversions': { en: 'Ad Conversions', es: 'Conversiones de Anuncios' },
  'LIVE GA4': { en: 'LIVE GA4', es: 'EN VIVO GA4' },
  
  // Scheduler
  'Compose Post': { en: 'Compose Post', es: 'Crear Post' },
  'Scheduled': { en: 'Scheduled', es: 'Programados' },
  'Post Content': { en: 'Post Content', es: 'Contenido del Post' },
  'AI Autocomplete': { en: 'AI Autocomplete', es: 'Autocompletado IA' },
  'Schedule': { en: 'Schedule', es: 'Programar' },
  'All Platforms': { en: 'All Platforms', es: 'Todas las Plataformas' },
  'Type your post here...': { en: 'Type your post here...', es: 'Escribe tu post aquí...' },
  'Add Media': { en: 'Add Media', es: 'Añadir Media' },
  'Generating...': { en: 'Generating...', es: 'Generando...' },
  'Post Timing': { en: 'Post Timing', es: 'Horario del Post' },
  'Time': { en: 'Time', es: 'Hora' },
  
  // Integrations
  'Connected Services': { en: 'Connected Services', es: 'Servicios Conectados' },
  'Connect': { en: 'Connect', es: 'Conectar' },
  'Disconnect': { en: 'Disconnect', es: 'Desconectar' },
  'Connect and manage your marketing channels.': { en: 'Connect and manage your marketing channels.', es: 'Conecta y gestiona tus canales de marketing.' },
  'Syncing...': { en: 'Syncing...', es: 'Sincronizando...' },
  'Failed 1h ago': { en: 'Failed 1h ago', es: 'Falló hace 1h' },
  '10 mins ago': { en: '10 mins ago', es: 'hace 10 min' },
  'Manage campaigns and track ad spend': { en: 'Manage campaigns and track ad spend', es: 'Gestionar campañas y seguimiento de gasto publicitario' },
  'B2B lead generation and targeted ads': { en: 'B2B lead generation and targeted ads', es: 'Generación de leads B2B y anuncios dirigidos' },
  'Manage GenZ targeting constraints': { en: 'Manage GenZ targeting constraints', es: 'Gestionar restricciones de segmentación GenZ' },
  'Schedule tweets and monitor trends': { en: 'Schedule tweets and monitor trends', es: 'Programar tweets y monitorear tendencias' },
  'Post scheduling and engagement metrics': { en: 'Post scheduling and engagement metrics', es: 'Programación de posts y métricas de interacción' },
  
  // Profile
  'Personal Details': { en: 'Personal Details', es: 'Detalles Personales' },
  'Save Changes': { en: 'Save Changes', es: 'Guardar Cambios' },
  'Quick Preferences': { en: 'Quick Preferences', es: 'Preferencias Rápidas' },
  'AI Campaign Alerts': { en: 'AI Campaign Alerts', es: 'Alertas de Campañas IA' },
  'Weekly Report Digest': { en: 'Weekly Report Digest', es: 'Resumen Semanal' },
  'Receive toast notifications for AI changes.': { en: 'Receive toast notifications for AI changes.', es: 'Recibir notificaciones flotantes de cambios de IA.' },
  'Email summary of ecommerce analytics.': { en: 'Email summary of ecommerce analytics.', es: 'Resumen por correo de analíticas ecommerce.' },
  'First Name': { en: 'First Name', es: 'Nombre' },
  'Last Name': { en: 'Last Name', es: 'Apellido' },
  'Email Address': { en: 'Email Address', es: 'Correo Electrónico' },
  'Role': { en: 'Role', es: 'Rol' },
  // App toasts
  'AI Alert: "GenZ Push" campaign CTR dropped below threshold. Action recommended.': { en: 'AI Alert: "GenZ Push" campaign CTR dropped below threshold. Action recommended.', es: 'Alerta IA: CTR de campaña "GenZ Push" cayó bajo el límite. Acción recomendada.' },
  'New conversion spike detected in Meta Ads! View Analytics.': { en: 'New conversion spike detected in Meta Ads! View Analytics.', es: '¡Nuevo pico de conversiones detectado en Meta Ads! Ver Analíticas.' },
  'Scheduled post was successfully published to Facebook and Twitter.': { en: 'Scheduled post was successfully published to Facebook and Twitter.', es: 'Post programado publicado exitosamente en Facebook y Twitter.' },
  'Sync Alert: LinkedIn Marketing API delayed response.': { en: 'Sync Alert: LinkedIn Marketing API delayed response.', es: 'Alerta de Sincronización: API de LinkedIn Marketing retrasada.' },
  'System online. AI Campaign Manager is actively optimizing.': { en: 'System online. AI Campaign Manager is actively optimizing.', es: 'Sistema en línea. El Gestor IA de Campañas está optimizando activamente.' },
  'Mark all as read': { en: 'Mark all as read', es: 'Marcar todo como leído' },
  'Clear all': { en: 'Clear all', es: 'Limpiar todo' },
  'No notifications': { en: 'No notifications', es: 'Sin notificaciones' },
  'Notifications': { en: 'Notifications', es: 'Notificaciones' },
  // User Management
  'User Management': { en: 'User Management', es: 'Gestión de Usuarios' },
  'Add, edit, or remove users and manage their roles.': { en: 'Add, edit, or remove users and manage their roles.', es: 'Agregar, editar o eliminar usuarios y gestionar roles.' },
  'Add User': { en: 'Add User', es: 'Agregar Usuario' },
  'Name': { en: 'Name', es: 'Nombre' },
  'Email': { en: 'Email', es: 'Correo' },
  'Actions': { en: 'Actions', es: 'Acciones' },
  'Admin': { en: 'Admin', es: 'Admin' },
  'User': { en: 'User', es: 'Usuario' },
  'Users': { en: 'Users', es: 'Usuarios' },
  'Edit User': { en: 'Edit User', es: 'Editar Usuario' },
  'Cancel': { en: 'Cancel', es: 'Cancelar' },
  'Please fill all fields': { en: 'Please fill all fields', es: 'Por favor complete todos los campos' },
  'User updated successfully': { en: 'User updated successfully', es: 'Usuario actualizado exitosamente' },
  'User created successfully': { en: 'User created successfully', es: 'Usuario creado exitosamente' },
  'You cannot delete yourself': { en: 'You cannot delete yourself', es: 'No puedes eliminarte a ti mismo' },
  'User deleted successfully': { en: 'User deleted successfully', es: 'Usuario eliminado exitosamente' },
  'Access Denied: Admin only': { en: 'Access Denied: Admin only', es: 'Acceso Denegado: Solo administradores' },
  'Sign In': { en: 'Sign In', es: 'Iniciar Sesión' },
  'Use admin@admin.com to login': { en: 'Use admin@admin.com to login', es: 'Usa admin@admin.com para iniciar sesión' },
  'Email is required': { en: 'Email is required', es: 'El correo es requerido' },
  'Invalid email or user does not exist': { en: 'Invalid email or user does not exist', es: 'Correo inválido o el usuario no existe' },
  'Password': { en: 'Password', es: 'Contraseña' },
  'Logout': { en: 'Logout', es: 'Cerrar Sesión' },
  'Get Started Now': { en: 'Get Started Now', es: 'Empieza Ahora' },
  'Please log in to your account to continue.': { en: 'Please log in to your account to continue.', es: 'Por favor inicia sesión en tu cuenta para continuar.' },
  'Enter your name...': { en: 'Enter your name...', es: 'Ingresa tu nombre...' },
  'Email address': { en: 'Email address', es: 'Correo electrónico' },
  'Forgot Password?': { en: 'Forgot Password?', es: '¿Olvidaste tu Contraseña?' },
  'I agree to the Terms & Privacy': { en: 'I agree to the Terms & Privacy', es: 'Acepto los Términos y la Privacidad' },
  'Log in': { en: 'Log in', es: 'Iniciar Sesión' },
  'Have an account?': { en: 'Have an account?', es: '¿Tienes una cuenta?' },
  'Sign up': { en: 'Sign up', es: 'Regístrate' },
  'Login with Google': { en: 'Login with Google', es: 'Iniciar con Google' },
  'Login with Apple': { en: 'Login with Apple', es: 'Iniciar con Apple' },
  'You can easily': { en: 'You can easily', es: 'Puedes fácilmente' },
  'Speed up your work with our Web App': { en: 'Speed up your work with our Web App', es: 'Acelera tu trabajo con nuestra Aplicación Web' },
  'Our partners': { en: 'Our partners', es: 'Nuestros colaboradores' },
  'Social Media Integrations': { en: 'Social Media Integrations', es: 'Integraciones a redes sociales' },
  'Demo Access: Quick Sign In automatically uses admin@admin.com': { en: 'Demo Access: Quick Sign In automatically uses admin@admin.com', es: 'Acceso de Prueba: El inicio de sesión rápido usa automáticamente admin@admin.com' },
  'CMS Control Center': { en: 'CMS Control Center', es: 'Centro de Control CMS' },
  'Manage and publish your digital content seamlessly': { en: 'Manage and publish your digital content seamlessly', es: 'Gestiona y publica tu contenido digital sin complicaciones' },
  'Already have an account?': { en: 'Already have an account?', es: '¿Ya tienes una cuenta?' },
  "Don't have an account?": { en: "Don't have an account?", es: '¿No tienes una cuenta?' },
  'First name': { en: 'First name', es: 'Nombre' },
  'Last name': { en: 'Last name', es: 'Apellido' },
  'First Name and Last Name are required': { en: 'First Name and Last Name are required', es: 'El nombre y apellido son obligatorios' },
  'Please agree to the Terms & Privacy': { en: 'Please agree to the Terms & Privacy', es: 'Por favor, acepta los Términos y Privacidad' },
  'Registration failed': { en: 'Registration failed', es: 'El registro falló' },
  'Invalid email or password': { en: 'Invalid email or password', es: 'Correo o contraseña incorrectos' },
  'Password is required': { en: 'Password is required', es: 'La contraseña es obligatoria' },
  'Create your Account': { en: 'Create your Account', es: 'Crea tu Cuenta' },
  'Fill in the fields below to sign up.': { en: 'Fill in the fields below to sign up.', es: 'Completa los campos a continuación para registrarte.' },
  'Quick Access Master Admin': { en: 'Quick Access Master Admin', es: 'Acceso Rápido Administrador Maestro' },
  'Log in as master admin': { en: 'Log in as master admin', es: 'Iniciar sesión como administrador maestro' },
  'Master admin account created successfully!': { en: 'Master admin account created successfully!', es: '¡Cuenta de administrador maestro creada con éxito!' },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('es');

  const toggleLang = () => setLang(l => (l === 'en' ? 'es' : 'en'));

  const t = (key: string) => {
    return dictionary[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
