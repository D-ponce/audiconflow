// Script para probar la creación de auditorías directamente
const testAuditCreation = async () => {
  try {
    console.log('🧪 Probando creación de auditoría...');
    
    const auditData = {
      name: 'Auditoría de Prueba',
      type: 'Inventario',
      location: 'Sucursal Test',
      priority: 'Media',
      dueDate: '2024-12-31',
      auditor: 'Usuario Test',
      description: 'Auditoría creada para probar el sistema'
    };

    const response = await fetch('http://localhost:5000/api/audits/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData)
    });

    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Response data:', data);

    if (data.success) {
      console.log('✅ Auditoría creada exitosamente:', data.audit.auditId);
      
      // Probar obtener auditorías
      console.log('\n🔍 Obteniendo lista de auditorías...');
      const listResponse = await fetch('http://localhost:5000/api/audits');
      const listData = await listResponse.json();
      console.log('📝 Auditorías encontradas:', listData.audits?.length || 0);
      
      if (listData.audits?.length > 0) {
        console.log('🎯 Última auditoría:', listData.audits[0].auditId);
      }
    } else {
      console.error('❌ Error:', data.message);
    }

  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:5000');
  }
};

// Ejecutar si se llama directamente
if (typeof window === 'undefined') {
  testAuditCreation();
}

// Exportar para uso en browser
if (typeof window !== 'undefined') {
  window.testAuditCreation = testAuditCreation;
}
