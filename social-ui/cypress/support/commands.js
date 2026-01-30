// Custom command to login
Cypress.Commands.add('login', (username, password) => {
    // We assume the UI has a login page at /login
    cy.visit('/login');
    cy.get('input[placeholder*="sername"]').type(username);
    cy.get('input[placeholder*="assword"]').type(password);
    cy.get('button[type="submit"]').click();
    // Wait for redirect to home/feed
    cy.url().should('include', '/');
});
