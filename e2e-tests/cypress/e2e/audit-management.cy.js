describe('Pruebas de Aceptación - Gestión de Auditorías', () => {
  beforeEach(() => {
    // Registrar usuarios de prueba
    cy.register({
      email: 'admin@acceptance.com',
      password: 'admin123',
      role: 'administrador'
    })
    
    cy.register({
      email: 'auditor@acceptance.com',
      password: 'auditor123',
      role: 'auditor'
    })
  })

  describe('Flujo Completo de Auditoría', () => {
    it('permite crear, asignar y gestionar auditoría completa', () => {
      // Login como administrador
      cy.login('admin@acceptance.com', 'admin123')
      cy.visit('/audit-records')
      
      // Crear nueva auditoría
      cy.get('[data-testid="create-audit-button"]').click()
      cy.get('input[name="name"]').type('Auditoría de Aceptación Test')
      cy.get('select[name="type"]').select('Inventario')
      cy.get('input[name="location"]').type('Almacén Principal')
      cy.get('select[name="priority"]').select('Alta')
      cy.get('input[name="auditor"]').type('auditor@acceptance.com')
      cy.get('textarea[name="description"]').type('Auditoría creada en pruebas de aceptación')
      
      // Guardar auditoría
      cy.get('button[type="submit"]').click()
      
      // Verificar creación exitosa
      cy.contains('Auditoría creada exitosamente').should('be.visible')
      cy.contains('Auditoría de Aceptación Test').should('be.visible')
      
      // Verificar que aparece en la tabla
      cy.get('[data-testid="audit-table"]').should('contain', 'Auditoría de Aceptación Test')
      cy.get('[data-testid="audit-table"]').should('contain', 'Inventario')
      cy.get('[data-testid="audit-table"]').should('contain', 'Alta')
      cy.get('[data-testid="audit-table"]').should('contain', 'Pendiente')
    })

    it('permite editar auditoría existente', () => {
      // Login y crear auditoría primero
      cy.login('admin@acceptance.com', 'admin123')
      cy.createAudit({
        name: 'Auditoría para Editar',
        type: 'Financiero',
        priority: 'Media',
        auditor: 'auditor@acceptance.com'
      })
      
      cy.visit('/audit-records')
      
      // Buscar y editar auditoría
      cy.contains('Auditoría para Editar').parent().find('[data-testid="edit-button"]').click()
      
      // Modificar campos
      cy.get('input[name="name"]').clear().type('Auditoría Editada')
      cy.get('select[name="priority"]').select('Baja')
      cy.get('textarea[name="description"]').clear().type('Descripción actualizada')
      
      // Guardar cambios
      cy.get('button[type="submit"]').click()
      
      // Verificar actualización
      cy.contains('Auditoría actualizada exitosamente').should('be.visible')
      cy.contains('Auditoría Editada').should('be.visible')
      cy.get('[data-testid="audit-table"]').should('contain', 'Baja')
    })

    it('permite filtrar auditorías por diferentes criterios', () => {
      cy.login('admin@acceptance.com', 'admin123')
      
      // Crear auditorías con diferentes características
      cy.createAudit({
        name: 'Auditoría Inventario',
        type: 'Inventario',
        priority: 'Alta',
        status: 'Pendiente'
      })
      
      cy.createAudit({
        name: 'Auditoría Financiera',
        type: 'Financiero',
        priority: 'Media',
        status: 'En Progreso'
      })
      
      cy.visit('/audit-records')
      
      // Filtrar por tipo
      cy.get('[data-testid="filter-type"]').select('Inventario')
      cy.get('[data-testid="audit-table"]').should('contain', 'Auditoría Inventario')
      cy.get('[data-testid="audit-table"]').should('not.contain', 'Auditoría Financiera')
      
      // Limpiar filtro
      cy.get('[data-testid="filter-type"]').select('Todos')
      
      // Filtrar por prioridad
      cy.get('[data-testid="filter-priority"]').select('Alta')
      cy.get('[data-testid="audit-table"]').should('contain', 'Auditoría Inventario')
      cy.get('[data-testid="audit-table"]').should('not.contain', 'Auditoría Financiera')
      
      // Filtrar por estado
      cy.get('[data-testid="filter-priority"]').select('Todas')
      cy.get('[data-testid="filter-status"]').select('En Progreso')
      cy.get('[data-testid="audit-table"]').should('contain', 'Auditoría Financiera')
      cy.get('[data-testid="audit-table"]').should('not.contain', 'Auditoría Inventario')
    })

    it('permite eliminar auditoría con confirmación', () => {
      cy.login('admin@acceptance.com', 'admin123')
      cy.createAudit({
        name: 'Auditoría para Eliminar',
        type: 'Operacional'
      })
      
      cy.visit('/audit-records')
      
      // Intentar eliminar
      cy.contains('Auditoría para Eliminar').parent().find('[data-testid="delete-button"]').click()
      
      // Verificar modal de confirmación
      cy.get('[data-testid="delete-modal"]').should('be.visible')
      cy.contains('¿Estás seguro?').should('be.visible')
      
      // Cancelar eliminación
      cy.get('[data-testid="cancel-delete"]').click()
      cy.get('[data-testid="delete-modal"]').should('not.exist')
      cy.contains('Auditoría para Eliminar').should('be.visible')
      
      // Confirmar eliminación
      cy.contains('Auditoría para Eliminar').parent().find('[data-testid="delete-button"]').click()
      cy.get('[data-testid="confirm-delete"]').click()
      
      // Verificar eliminación
      cy.contains('Auditoría eliminada exitosamente').should('be.visible')
      cy.contains('Auditoría para Eliminar').should('not.exist')
    })
  })

  describe('Flujo de Auditor', () => {
    it('auditor puede ver solo sus auditorías asignadas', () => {
      // Crear auditorías como admin
      cy.login('admin@acceptance.com', 'admin123')
      cy.createAudit({
        name: 'Auditoría Asignada',
        auditor: 'auditor@acceptance.com'
      })
      cy.createAudit({
        name: 'Auditoría No Asignada',
        auditor: 'otro@auditor.com'
      })
      
      // Login como auditor
      cy.login('auditor@acceptance.com', 'auditor123')
      cy.visit('/audit-records')
      
      // Verificar que solo ve sus auditorías
      cy.contains('Auditoría Asignada').should('be.visible')
      cy.contains('Auditoría No Asignada').should('not.exist')
    })

    it('auditor puede actualizar estado de sus auditorías', () => {
      cy.login('admin@acceptance.com', 'admin123')
      cy.createAudit({
        name: 'Auditoría Estado Test',
        auditor: 'auditor@acceptance.com',
        status: 'Pendiente'
      })
      
      // Login como auditor
      cy.login('auditor@acceptance.com', 'auditor123')
      cy.visit('/audit-records')
      
      // Cambiar estado
      cy.contains('Auditoría Estado Test').parent().find('[data-testid="edit-button"]').click()
      cy.get('select[name="status"]').select('En Progreso')
      cy.get('textarea[name="description"]').type('Iniciando trabajo de auditoría')
      cy.get('button[type="submit"]').click()
      
      // Verificar cambio
      cy.contains('Auditoría actualizada exitosamente').should('be.visible')
      cy.get('[data-testid="audit-table"]').should('contain', 'En Progreso')
    })
  })
})
