describe('Pruebas E2E - Procesamiento de Datos (MEJORADO)', () => {
  beforeEach(() => {
    // Configurar usuario y auditoría de prueba
    cy.register({
      email: 'processor@acceptance.com',
      password: 'processor123',
      role: 'auditor'
    })
    
    cy.login('processor@acceptance.com', 'processor123')
    
    // Crear auditoría para vincular archivos
    cy.createAudit({
      name: 'Auditoría Procesamiento',
      type: 'Inventario',
      auditor: 'processor@acceptance.com'
    }).then((audit) => {
      cy.wrap(audit.auditId).as('auditId')
    })
  })

  describe('Carga y Procesamiento de Archivos', () => {
    it('permite cargar archivo Excel y procesar datos', () => {
      cy.get('@auditId').then((auditId) => {
        cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
        
        // Verificar página de carga
        cy.contains('Carga y Procesamiento de Datos').should('be.visible')
        cy.get('[data-testid="file-upload-zone"]').should('be.visible')
        
        // Simular carga de archivo
        const fileName = 'inventario-test.xlsx'
        cy.fixture(fileName).then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        })
        
        // Verificar que el archivo se cargó
        cy.contains(fileName).should('be.visible')
        cy.get('[data-testid="process-button"]').should('be.enabled')
        
        // Procesar archivo
        cy.get('[data-testid="process-button"]').click()
        
        // Verificar procesamiento
        cy.contains('Procesando archivo...').should('be.visible')
        cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
        
        // Verificar datos procesados
        cy.get('[data-testid="processed-data-table"]').should('be.visible')
        cy.get('[data-testid="data-row"]').should('have.length.at.least', 1)
      })
    })

    it('muestra historial de archivos cargados', () => {
      cy.get('@auditId').then((auditId) => {
        cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
        
        // Cargar archivo
        cy.fixture('inventario-test.xlsx').then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: 'historial-test.xlsx'
          })
        })
        
        cy.get('[data-testid="process-button"]').click()
        cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
        
        // Verificar historial
        cy.get('[data-testid="upload-history-button"]').click()
        cy.get('[data-testid="history-modal"]').should('be.visible')
        cy.contains('historial-test.xlsx').should('be.visible')
        cy.get('[data-testid="history-item"]').should('have.length.at.least', 1)
        
        // Verificar detalles del archivo
        cy.get('[data-testid="file-details-button"]').first().click()
        cy.contains('Detalles del Archivo').should('be.visible')
        cy.contains('Fecha de carga').should('be.visible')
        cy.contains('Tamaño').should('be.visible')
        cy.contains('Estado').should('be.visible')
      })
    })
  })

  describe('Cruce de Información', () => {
    it('permite realizar cruce de datos entre archivos', () => {
      cy.get('@auditId').then((auditId) => {
        cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
        
        // Cargar primer archivo
        cy.fixture('archivo1.xlsx').then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: 'archivo1.xlsx'
          })
        })
        cy.get('[data-testid="process-button"]').click()
        cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
        
        // Cargar segundo archivo
        cy.fixture('archivo2.xlsx').then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: 'archivo2.xlsx'
          })
        })
        cy.get('[data-testid="process-button"]').click()
        cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
        
        // Realizar cruce
        cy.get('[data-testid="cross-data-button"]').click()
        cy.get('[data-testid="cross-modal"]').should('be.visible')
        
        // Seleccionar archivos y campos
        cy.get('select[name="file1"]').select('archivo1.xlsx')
        cy.get('select[name="file2"]').select('archivo2.xlsx')
        cy.get('select[name="key1"]').select(0) // Primer campo disponible
        cy.get('select[name="key2"]').select(0) // Primer campo disponible
        
        // Ejecutar cruce
        cy.get('[data-testid="execute-cross-button"]').click()
        
        // Verificar resultados
        cy.contains('Cruce completado exitosamente', { timeout: 15000 }).should('be.visible')
        cy.get('[data-testid="cross-results-table"]').should('be.visible')
        cy.get('[data-testid="cross-summary"]').should('be.visible')
        
        // Verificar estadísticas
        cy.contains('Total de registros').should('be.visible')
        cy.contains('Coincidencias').should('be.visible')
        cy.contains('Sin coincidencias').should('be.visible')
      })
    })

    it('permite generar reporte PDF de resultados', () => {
      cy.get('@auditId').then((auditId) => {
        // Realizar cruce primero (simplificado)
        cy.performDataCross(auditId, 'archivo1.xlsx', 'archivo2.xlsx')
        
        // Generar reporte
        cy.get('[data-testid="generate-report-button"]').click()
        
        // Verificar descarga de PDF
        cy.contains('Generando reporte...').should('be.visible')
        cy.contains('Reporte generado exitosamente', { timeout: 10000 }).should('be.visible')
        
        // Verificar que se guardó en reportes
        cy.visit('/saved-reports')
        cy.contains('Reporte de Cruce').should('be.visible')
        cy.get('[data-testid="report-item"]').should('have.length.at.least', 1)
      })
    })
  })

  describe('Validaciones y Manejo de Errores', () => {
    it('valida formato de archivos correctamente', () => {
      cy.get('@auditId').then((auditId) => {
        cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
        
        // Intentar cargar archivo inválido
        cy.fixture('archivo-invalido.txt').then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: 'archivo-invalido.txt'
          })
        })
        
        // Verificar error de formato
        cy.contains('Formato de archivo no válido').should('be.visible')
        cy.get('[data-testid="process-button"]').should('be.disabled')
      })
    })

    it('maneja errores de procesamiento gracefully', () => {
      cy.get('@auditId').then((auditId) => {
        cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
        
        // Cargar archivo corrupto
        cy.fixture('archivo-corrupto.xlsx').then(fileContent => {
          cy.get('input[type="file"]').selectFile({
            contents: fileContent,
            fileName: 'archivo-corrupto.xlsx'
          })
        })
        
        cy.get('[data-testid="process-button"]').click()
        
        // Verificar manejo de error
        cy.contains('Error al procesar archivo').should('be.visible')
        cy.get('[data-testid="error-details"]').should('be.visible')
        cy.get('[data-testid="retry-button"]').should('be.visible')
      })
    })
  })
})
