describe('Admin Dashboard', () => {
    beforeEach(() => {
        // Assume 'admin' user exists with password 'admin' (seeded dev data)
        // If not, we might need to register one or seed it. 
        // Based on previous context, 'admin' user is seeded.
        cy.login('admin', 'admin');
        cy.wait(1000); // Wait for login
    });

    it('should navigate to admin dashboard', () => {
        cy.visit('/admin');
        cy.contains('Admin Dashboard').should('be.visible');
        cy.contains('Manage users and moderate content').should('be.visible');
    });

    it('should display tabs', () => {
        cy.visit('/admin');
        cy.contains('button', 'Reports').should('be.visible');
        cy.contains('button', 'Users').should('be.visible');
        cy.contains('button', 'Audit Logs').should('be.visible');
    });

    it('should load audit logs', () => {
        cy.visit('/admin');
        cy.contains('button', 'Audit Logs').click();
        cy.contains('Audit Logs (Last 50 Actions)').should('be.visible');
        // Check if list exists (might be empty but container should be there)
    });
});
