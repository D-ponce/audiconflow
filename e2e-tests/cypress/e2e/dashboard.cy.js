describe('Pruebas E2E - Dashboard', () => {
  beforeEach(() => {
    // Configurar usuario y datos de prueba
    cy.register({
      email: 'dashboard@test.com',
      password: 'dashboard123',
      role: 'auditor'
    })
    
    // Crear algunas auditorías de prueba
    cy.createAudit({
      name: 'Auditoría Dashboard Test 1',
      type: 'Inventario',
      priority: 'Alta',
      auditor: 'dashboard@test.com'
    })
    
    cy.createAudit({
      name: 'Auditoría Dashboard Test 2',
      type: 'Financiero',
      priority: 'Media',
      auditor: 'dashboard@test.com'
    })
    
    // Login
    cy.login('dashboard@test.com', 'dashboard123')
  })

  it('muestra métricas principales correctamente', () => {
    cy.visit('/dashboard')
    
    // Verificar que las tarjetas de métricas están presentes
    cy.get('[data-testid="metric-card"]').should('have.length.at.least', 3)
    
    // Verificar métricas específicas
    cy.contains('Auditorías Activas').should('be.visible')
    cy.contains('Auditorías Completadas').should('be.visible')
    cy.contains('Auditorías Pendientes').should('be.visible')
    
    // Verificar que los números son válidos
    cy.get('[data-testid="metric-value"]').each(($el) => {
      cy.wrap($el).should('contain.text', /^\d+$/)
    })
  })

  it('muestra gráficos de tendencias', () => {
    cy.visit('/dashboard')
    
    // Verificar que el gráfico de tendencias está presente
    cy.get('[data-testid="audit-trends-chart"]').should('be.visible')
    
    // Verificar elementos del gráfico
    cy.get('[data-testid="chart-container"]').should('be.visible')
    cy.contains('Tendencias de Auditorías').should('be.visible')
  })

  it('permite navegación a diferentes secciones', () => {
    cy.visit('/dashboard')
    
    // Verificar menú de navegación
    cy.get('[data-testid="nav-menu"]').should('be.visible')
    
    // Navegar a auditorías
    cy.get('[data-testid="nav-audits"]').click()
    cy.url().should('include', '/audit-records')
    
    // Regresar al dashboard
    cy.get('[data-testid="nav-dashboard"]').click()
    cy.url().should('include', '/dashboard')
    
    // Navegar a usuarios
    cy.get('[data-testid="nav-users"]').click()
    cy.url().should('include', '/user-management')
  })

  it('muestra actividad reciente', () => {
    cy.visit('/dashboard')
    
    // Verificar sección de actividad reciente
    cy.contains('Actividad Reciente').should('be.visible')
    cy.get('[data-testid="activity-feed"]').should('be.visible')
    
    // Verificar que hay elementos de actividad
    cy.get('[data-testid="activity-item"]').should('have.length.at.least', 1)
  })

  it('permite acciones rápidas', () => {
    cy.visit('/dashboard')
    
    // Verificar botones de acción rápida
    cy.get('[data-testid="quick-actions"]').should('be.visible')
    cy.contains('Nueva Auditoría').should('be.visible')
    cy.contains('Generar Reporte').should('be.visible')
    
    // Probar acción rápida de nueva auditoría
    cy.contains('Nueva Auditoría').click()
    cy.url().should('include', '/audit-records')
  })

  it('es responsive en diferentes tamaños de pantalla', () => {
    cy.visit('/dashboard')
    
    // Probar en móvil
    cy.viewport(375, 667)
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
    cy.get('[data-testid="metric-card"]').should('be.visible')
    
    // Probar en tablet
    cy.viewport(768, 1024)
    cy.get('[data-testid="dashboard-grid"]').should('be.visible')
    
    // Probar en desktop
    cy.viewport(1280, 720)
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible')
  })
})
