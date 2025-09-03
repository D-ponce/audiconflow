describe('Pruebas de Aceptación - Gestión de Usuarios', () => {
  beforeEach(() => {
    // Registrar administrador de prueba
    cy.register({
      email: 'admin@usermgmt.com',
      password: 'admin123',
      role: 'administrador'
    })
    
    cy.login('admin@usermgmt.com', 'admin123')
  })

  describe('Gestión Completa de Usuarios', () => {
    it('permite crear nuevo usuario desde panel de administración', () => {
      cy.visit('/user-management')
      
      // Verificar página de gestión
      cy.contains('Gestión de Usuarios').should('be.visible')
      cy.get('[data-testid="users-table"]').should('be.visible')
      
      // Crear nuevo usuario
      cy.get('[data-testid="create-user-button"]').click()
      cy.get('[data-testid="user-modal"]').should('be.visible')
      
      // Llenar formulario
      cy.get('input[name="email"]').type('nuevo@usuario.com')
      cy.get('input[name="password"]').type('password123')
      cy.get('select[name="role"]').select('auditor')
      
      // Guardar usuario
      cy.get('button[type="submit"]').click()
      
      // Verificar creación
      cy.contains('Usuario creado exitosamente').should('be.visible')
      cy.get('[data-testid="users-table"]').should('contain', 'nuevo@usuario.com')
      cy.get('[data-testid="users-table"]').should('contain', 'auditor')
    })

    it('muestra último acceso de usuarios correctamente', () => {
      // Crear usuario de prueba
      cy.register({
        email: 'lastaccess@test.com',
        password: 'test123',
        role: 'auditor'
      })
      
      // Login con el nuevo usuario para generar último acceso
      cy.login('lastaccess@test.com', 'test123')
      cy.visit('/dashboard')
      
      // Volver como admin para verificar último acceso
      cy.login('admin@usermgmt.com', 'admin123')
      cy.visit('/user-management')
      
      // Verificar que se muestra último acceso
      cy.get('[data-testid="users-table"]').should('contain', 'lastaccess@test.com')
      cy.contains('lastaccess@test.com').parent().should('contain.text', /Hace|minutos|horas/)
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

  describe('Filtros y Búsqueda', () => {
    it('permite filtrar usuarios por rol', () => {
      // Crear usuarios con diferentes roles
      cy.register({
        email: 'admin2@test.com',
        password: 'admin123',
        role: 'administrador'
      })
      
      cy.register({
        email: 'auditor2@test.com',
        password: 'auditor123',
        role: 'auditor'
      })
      
      cy.visit('/user-management')
      
      // Filtrar por administradores
      cy.get('[data-testid="role-filter"]').select('administrador')
      cy.get('[data-testid="users-table"]').should('contain', 'admin2@test.com')
      cy.get('[data-testid="users-table"]').should('not.contain', 'auditor2@test.com')
      
      // Filtrar por auditores
      cy.get('[data-testid="role-filter"]').select('auditor')
      cy.get('[data-testid="users-table"]').should('contain', 'auditor2@test.com')
      cy.get('[data-testid="users-table"]').should('not.contain', 'admin2@test.com')
    })

    it('permite buscar usuarios por email', () => {
      cy.register({
        email: 'busqueda@test.com',
        password: 'search123',
        role: 'auditor'
      })
      
      cy.visit('/user-management')
      
      // Buscar usuario
      cy.get('[data-testid="search-input"]').type('busqueda@test.com')
      cy.get('[data-testid="search-button"]').click()
      
      // Verificar resultados
      cy.get('[data-testid="users-table"]').should('contain', 'busqueda@test.com')
      cy.get('[data-testid="user-row"]').should('have.length', 1)
      
      // Limpiar búsqueda
      cy.get('[data-testid="clear-search"]').click()
      cy.get('[data-testid="user-row"]').should('have.length.greaterThan', 1)
    })
  })
})
