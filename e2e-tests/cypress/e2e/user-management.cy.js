describe('Pruebas E2E - Gestión de Usuarios (MEJORADO)', () => {
  beforeEach(() => {
    // Setup mejorado con limpieza de datos
    cy.task('db:seed')
    
    // Registrar administrador de prueba con datos consistentes
    cy.register({
      email: 'admin@usermgmt.com',
      password: 'admin123',
      role: 'administrador'
    })
    
    cy.login('admin@usermgmt.com', 'admin123')
    
    // Interceptar llamadas API para mejor control
    cy.intercept('GET', '/api/users*').as('getUsers')
    cy.intercept('POST', '/api/users').as('createUser')
    cy.intercept('PUT', '/api/users/*').as('updateUser')
    cy.intercept('DELETE', '/api/users/*').as('deleteUser')
  })
  
  afterEach(() => {
    // Limpieza automática post-prueba
    cy.task('db:clean')
  })

  describe('Gestión Completa de Usuarios', () => {
    it('permite crear nuevo usuario desde panel de administración', () => {
      cy.visit('/user-management')
      
      // Esperar carga completa con interceptores
      cy.wait('@getUsers')
      
      // Verificar página de gestión con selectores robustos
      cy.get('[data-cy="page-title"]').should('contain', 'Gestión de Usuarios')
      cy.get('[data-cy="users-table"]').should('be.visible')
      cy.get('[data-cy="loading-spinner"]').should('not.exist')
      
      // Crear nuevo usuario con validaciones mejoradas
      cy.get('[data-cy="create-user-btn"]').should('be.enabled').click()
      cy.get('[data-cy="user-modal"]').should('be.visible')
      cy.get('[data-cy="modal-title"]').should('contain', 'Crear Usuario')
      
      // Llenar formulario con validaciones
      const userEmail = `nuevo-${Date.now()}@usuario.com`
      cy.get('[data-cy="email-input"]').type(userEmail)
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="role-select"]').select('auditor')
      
      // Validar campos antes de enviar
      cy.get('[data-cy="email-input"]').should('have.value', userEmail)
      cy.get('[data-cy="role-select"]').should('have.value', 'auditor')
      
      // Guardar usuario y esperar respuesta
      cy.get('[data-cy="submit-btn"]').click()
      cy.wait('@createUser')
      
      // Verificar creación con mejor aserción
      cy.get('[data-cy="success-message"]').should('contain', 'Usuario creado exitosamente')
      cy.get('[data-cy="users-table"]').should('contain', userEmail)
      cy.get(`[data-cy="user-row-${userEmail}"]`).should('contain', 'auditor')
      cy.get('[data-cy="user-modal"]').should('not.exist')
    })

    it('muestra último acceso de usuarios correctamente', () => {
      const testEmail = `lastaccess-${Date.now()}@test.com`
      
      // Crear usuario de prueba con datos únicos
      cy.register({
        email: testEmail,
        password: 'test123',
        role: 'auditor'
      })
      
      // Login con el nuevo usuario para generar último acceso
      cy.login(testEmail, 'test123')
      cy.visit('/dashboard')
      cy.wait(2000) // Asegurar que se registre el acceso
      
      // Volver como admin para verificar último acceso
      cy.login('admin@usermgmt.com', 'admin123')
      cy.visit('/user-management')
      cy.wait('@getUsers')
      
      // Verificar que se muestra último acceso con mejor selección
      cy.get('[data-cy="users-table"]').should('contain', testEmail)
      cy.get(`[data-cy="user-row-${testEmail}"]`)
        .find('[data-cy="last-access"]')
        .should('match', /Hace (un momento|\d+ (minutos?|horas?|días?))/)
      
      // Verificar formato de fecha para usuarios sin acceso previo
      cy.get('[data-cy="users-table"]')
        .find('[data-cy="last-access"]:contains("Nunca")')
        .should('exist')
    })

    it('permite editar información de usuario', () => {
      // Crear usuario para editar
      cy.register({
        email: 'editar@usuario.com',
        password: 'edit123',
        role: 'auditor'
      })
      
      cy.visit('/user-management')
      
      // Editar usuario
      cy.contains('editar@usuario.com').parent().find('[data-testid="edit-user-button"]').click()
      cy.get('[data-testid="user-modal"]').should('be.visible')
      
      // Cambiar rol
      cy.get('select[name="role"]').select('administrador')
      cy.get('button[type="submit"]').click()
      
      // Verificar cambio
      cy.contains('Usuario actualizado exitosamente').should('be.visible')
      cy.contains('editar@usuario.com').parent().should('contain', 'administrador')
    })

    it('permite eliminar usuario con confirmación', () => {
      // Crear usuario para eliminar
      cy.register({
        email: 'eliminar@usuario.com',
        password: 'delete123',
        role: 'auditor'
      })
      
      cy.visit('/user-management')
      
      // Intentar eliminar
      cy.contains('eliminar@usuario.com').parent().find('[data-testid="delete-user-button"]').click()
      
      // Verificar confirmación
      cy.get('[data-testid="delete-confirmation"]').should('be.visible')
      cy.contains('¿Estás seguro de eliminar este usuario?').should('be.visible')
      
      // Confirmar eliminación
      cy.get('[data-testid="confirm-delete-user"]').click()
      
      // Verificar eliminación
      cy.contains('Usuario eliminado exitosamente').should('be.visible')
      cy.contains('eliminar@usuario.com').should('not.exist')
    })
  })

  describe('Filtros y Búsqueda Mejorados', () => {
    it('permite filtrar usuarios por rol con validación completa', () => {
      const timestamp = Date.now()
      const adminEmail = `admin-${timestamp}@test.com`
      const auditorEmail = `auditor-${timestamp}@test.com`
      const viewerEmail = `viewer-${timestamp}@test.com`
      
      // Crear usuarios con diferentes roles usando datos únicos
      cy.register({ email: adminEmail, password: 'admin123', role: 'administrador' })
      cy.register({ email: auditorEmail, password: 'auditor123', role: 'auditor' })
      cy.register({ email: viewerEmail, password: 'viewer123', role: 'viewer' })
      
      cy.visit('/user-management')
      cy.wait('@getUsers')
      
      // Verificar estado inicial (todos los usuarios)
      cy.get('[data-cy="users-table"]').should('contain', adminEmail)
      cy.get('[data-cy="users-table"]').should('contain', auditorEmail)
      cy.get('[data-cy="users-table"]').should('contain', viewerEmail)
      
      // Filtrar por administradores
      cy.get('[data-cy="role-filter"]').select('administrador')
      cy.get('[data-cy="filter-loading"]').should('not.exist')
      cy.get('[data-cy="users-table"]').should('contain', adminEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', auditorEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', viewerEmail)
      
      // Filtrar por auditores
      cy.get('[data-cy="role-filter"]').select('auditor')
      cy.get('[data-cy="users-table"]').should('contain', auditorEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', adminEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', viewerEmail)
      
      // Filtrar por viewers
      cy.get('[data-cy="role-filter"]').select('viewer')
      cy.get('[data-cy="users-table"]').should('contain', viewerEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', adminEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', auditorEmail)
      
      // Limpiar filtro
      cy.get('[data-cy="role-filter"]').select('todos')
      cy.get('[data-cy="users-table"]').should('contain', adminEmail)
      cy.get('[data-cy="users-table"]').should('contain', auditorEmail)
      cy.get('[data-cy="users-table"]').should('contain', viewerEmail)
    })

    it('permite buscar usuarios por email con validación avanzada', () => {
      const searchEmail = `busqueda-${Date.now()}@test.com`
      const otherEmail = `otro-${Date.now()}@test.com`
      
      // Crear múltiples usuarios para prueba de búsqueda
      cy.register({ email: searchEmail, password: 'search123', role: 'auditor' })
      cy.register({ email: otherEmail, password: 'other123', role: 'viewer' })
      
      cy.visit('/user-management')
      cy.wait('@getUsers')
      
      // Verificar estado inicial
      cy.get('[data-cy="users-table"]').should('contain', searchEmail)
      cy.get('[data-cy="users-table"]').should('contain', otherEmail)
      
      // Buscar usuario específico
      cy.get('[data-cy="search-input"]').type(searchEmail)
      cy.get('[data-cy="search-btn"]').click()
      
      // Verificar resultados de búsqueda
      cy.get('[data-cy="search-loading"]').should('not.exist')
      cy.get('[data-cy="users-table"]').should('contain', searchEmail)
      cy.get('[data-cy="users-table"]').should('not.contain', otherEmail)
      cy.get('[data-cy="user-row"]').should('have.length', 1)
      
      // Probar búsqueda parcial
      cy.get('[data-cy="search-input"]').clear().type('busqueda')
      cy.get('[data-cy="search-btn"]').click()
      cy.get('[data-cy="users-table"]').should('contain', searchEmail)
      
      // Probar búsqueda sin resultados
      cy.get('[data-cy="search-input"]').clear().type('noexiste@test.com')
      cy.get('[data-cy="search-btn"]').click()
      cy.get('[data-cy="no-results"]').should('be.visible')
      cy.get('[data-cy="no-results"]').should('contain', 'No se encontraron usuarios')
      
      // Limpiar búsqueda
      cy.get('[data-cy="clear-search-btn"]').click()
      cy.get('[data-cy="search-input"]').should('have.value', '')
      cy.get('[data-cy="user-row"]').should('have.length.greaterThan', 1)
      cy.get('[data-cy="users-table"]').should('contain', searchEmail)
      cy.get('[data-cy="users-table"]').should('contain', otherEmail)
    })
    
    it('maneja estados de carga y errores en filtros', () => {
      cy.visit('/user-management')
      cy.wait('@getUsers')
      
      // Simular error de red
      cy.intercept('GET', '/api/users*', { forceNetworkError: true }).as('getUsersError')
      
      cy.get('[data-cy="role-filter"]').select('auditor')
      cy.wait('@getUsersError')
      
      // Verificar manejo de errores
      cy.get('[data-cy="error-message"]').should('be.visible')
      cy.get('[data-cy="error-message"]').should('contain', 'Error al cargar usuarios')
      cy.get('[data-cy="retry-btn"]').should('be.visible')
      
      // Probar reintento
      cy.intercept('GET', '/api/users*').as('getUsersRetry')
      cy.get('[data-cy="retry-btn"]').click()
      cy.wait('@getUsersRetry')
      cy.get('[data-cy="error-message"]').should('not.exist')
    })
  })
  
  describe('Casos Edge y Validaciones Avanzadas', () => {
    it('maneja concurrencia en operaciones de usuario', () => {
      const email1 = `concurrent1-${Date.now()}@test.com`
      const email2 = `concurrent2-${Date.now()}@test.com`
      
      cy.visit('/user-management')
      cy.wait('@getUsers')
      
      // Crear múltiples usuarios simultáneamente
      cy.get('[data-cy="create-user-btn"]').click()
      cy.get('[data-cy="email-input"]').type(email1)
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="role-select"]').select('auditor')
      
      // Simular operación lenta
      cy.intercept('POST', '/api/users', { delay: 2000 }).as('slowCreateUser')
      cy.get('[data-cy="submit-btn"]').click()
      
      // Intentar crear otro usuario mientras el primero está en proceso
      cy.get('[data-cy="create-user-btn"]').should('be.disabled')
      cy.get('[data-cy="loading-overlay"]').should('be.visible')
      
      cy.wait('@slowCreateUser')
      cy.get('[data-cy="create-user-btn"]').should('be.enabled')
    })
    
    it('valida límites de entrada y caracteres especiales', () => {
      cy.visit('/user-management')
      
      cy.get('[data-cy="create-user-btn"]').click()
      
      // Probar email con caracteres especiales
      const specialEmail = 'test+special.email@sub-domain.co.uk'
      cy.get('[data-cy="email-input"]').type(specialEmail)
      cy.get('[data-cy="password-input"]').type('password123')
      cy.get('[data-cy="role-select"]').select('auditor')
      
      cy.get('[data-cy="submit-btn"]').click()
      cy.wait('@createUser')
      
      cy.get('[data-cy="success-message"]').should('be.visible')
      cy.get('[data-cy="users-table"]').should('contain', specialEmail)
    })
    
    it('maneja timeouts y reconexiones', () => {
      cy.visit('/user-management')
      
      // Simular timeout
      cy.intercept('GET', '/api/users*', { delay: 30000 }).as('timeoutUsers')
      cy.get('[data-cy="refresh-btn"]').click()
      
      // Verificar indicador de timeout
      cy.get('[data-cy="timeout-warning"]', { timeout: 10000 }).should('be.visible')
      cy.get('[data-cy="cancel-request-btn"]').click()
      
      // Restaurar conexión normal
      cy.intercept('GET', '/api/users*').as('normalUsers')
      cy.get('[data-cy="refresh-btn"]').click()
      cy.wait('@normalUsers')
      
      cy.get('[data-cy="users-table"]').should('be.visible')
    })
  })
})
