describe('Pruebas de Aceptación - Flujo de Reportes', () => {
  beforeEach(() => {
    // Configurar usuarios y datos de prueba
    cy.register({
      email: 'reports@acceptance.com',
      password: 'reports123',
      role: 'administrador'
    })
    
    cy.login('reports@acceptance.com', 'reports123')
    
    // Crear auditoría y datos para reportes
    cy.createAudit({
      name: 'Auditoría Reportes Test',
      type: 'Inventario',
      auditor: 'reports@acceptance.com'
    }).then((audit) => {
      cy.wrap(audit.auditId).as('auditId')
    })
  })

  describe('Gestión de Reportes Guardados', () => {
    it('muestra reportes existentes y permite visualización', () => {
      cy.visit('/saved-reports')
      
      // Verificar página de reportes
      cy.contains('Reportes Guardados').should('be.visible')
      cy.get('[data-testid="reports-grid"]').should('be.visible')
      
      // Verificar filtros disponibles
      cy.get('[data-testid="category-filter"]').should('be.visible')
      cy.get('[data-testid="search-reports"]').should('be.visible')
      
      // Si hay reportes, verificar estructura
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="report-card"]').length > 0) {
          cy.get('[data-testid="report-card"]').first().within(() => {
            cy.get('[data-testid="report-title"]').should('be.visible')
            cy.get('[data-testid="report-category"]').should('be.visible')
            cy.get('[data-testid="report-date"]').should('be.visible')
            cy.get('[data-testid="view-report-button"]').should('be.visible')
          })
        }
      })
    })

    it('permite filtrar reportes por categoría', () => {
      cy.visit('/saved-reports')
      
      // Filtrar por categoría específica
      cy.get('[data-testid="category-filter"]').select('Cruce de Datos')
      
      // Verificar que solo se muestran reportes de esa categoría
      cy.get('[data-testid="report-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="report-category"]').should('contain', 'Cruce de Datos')
      })
      
      // Probar otras categorías
      cy.get('[data-testid="category-filter"]').select('Inventario')
      cy.get('[data-testid="category-filter"]').select('Todas las Categorías')
    })

    it('permite eliminar reportes', () => {
      cy.visit('/saved-reports')
      
      // Si hay reportes, probar eliminación
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="report-card"]').length > 0) {
          const reportCount = $body.find('[data-testid="report-card"]').length
          
          // Eliminar primer reporte
          cy.get('[data-testid="report-card"]').first().within(() => {
            cy.get('[data-testid="delete-report-button"]').click()
          })
          
          // Confirmar eliminación
          cy.get('[data-testid="confirm-delete-modal"]').should('be.visible')
          cy.get('[data-testid="confirm-delete-button"]').click()
          
          // Verificar eliminación
          cy.contains('Reporte eliminado exitosamente').should('be.visible')
          cy.get('[data-testid="report-card"]').should('have.length', reportCount - 1)
        }
      })
    })
  })

  describe('Generación de Reportes desde Cruce', () => {
    it('genera reporte automáticamente después de cruce exitoso', () => {
      cy.get('@auditId').then((auditId) => {
        // Realizar cruce de datos completo
        cy.performDataCross(auditId, 'inventario.xlsx', 'sistema.xlsx')
        
        // Verificar que se creó reporte automáticamente
        cy.visit('/saved-reports')
        cy.contains('Reporte de Cruce').should('be.visible')
        
        // Verificar detalles del reporte
        cy.get('[data-testid="report-card"]').first().within(() => {
          cy.contains('Cruce de Datos').should('be.visible')
          cy.get('[data-testid="report-views"]').should('contain.text', /\d+/)
          cy.get('[data-testid="report-size"]').should('be.visible')
        })
      })
    })

    it('permite descargar reporte PDF generado', () => {
      cy.get('@auditId').then((auditId) => {
        cy.performDataCross(auditId, 'test1.xlsx', 'test2.xlsx')
        
        cy.visit('/saved-reports')
        
        // Descargar reporte
        cy.get('[data-testid="report-card"]').first().within(() => {
          cy.get('[data-testid="download-pdf-button"]').click()
        })
        
        // Verificar descarga (Cypress no puede verificar descarga real, pero sí el click)
        cy.contains('Descargando reporte...').should('be.visible')
        
        // Verificar que se incrementó el contador de vistas
        cy.reload()
        cy.get('[data-testid="report-card"]').first().within(() => {
          cy.get('[data-testid="report-views"]').should('contain.text', /[1-9]/)
        })
      })
    })
  })

  describe('Búsqueda y Navegación', () => {
    it('permite buscar reportes por nombre', () => {
      cy.visit('/saved-reports')
      
      // Buscar reporte específico
      cy.get('[data-testid="search-reports"]').type('Cruce')
      cy.get('[data-testid="search-button"]').click()
      
      // Verificar resultados de búsqueda
      cy.get('[data-testid="report-card"]').each(($card) => {
        cy.wrap($card).should('contain.text', /Cruce/i)
      })
      
      // Limpiar búsqueda
      cy.get('[data-testid="clear-search"]').click()
      cy.get('[data-testid="search-reports"]').should('have.value', '')
    })

    it('permite navegación entre páginas de reportes', () => {
      cy.visit('/saved-reports')
      
      // Verificar paginación si hay suficientes reportes
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should('be.visible')
          cy.get('[data-testid="next-page"]').click()
          cy.url().should('include', 'page=2')
          
          cy.get('[data-testid="prev-page"]').click()
          cy.url().should('include', 'page=1')
        }
      })
    })
  })
})
