# Demo Sigurnosnih Ranjivosti

Ova web aplikacija demonstrira dvije sigurnosne ranjivosti: SQL umetanje (SQL Injection) i Cross-Site Request Forgery (CSRF). Aplikacija omogućuje uključivanje i isključivanje svake ranjivosti putem korisničkog sučelja.

## Značajke
- **SQL umetanje**: Omogućuje testiranje SQL Injection napada uključivanjem ili isključivanjem ranjivosti.
- **CSRF**: Omogućuje ili onemogućuje CSRF zaštitu za simulaciju uspješnih ili neuspješnih napada.

## Upute za korištenje
1. **SQL Injection**:
   - Otvorite stranicu za SQL Injection i unesite korisničko ime (admin ili user) za dohvat informacija o korisniku.
   - Omogućite ili onemogućite SQL Injection ranjivost pomoću checkboxa.
   - Testirajte unosom SQL injection izraza (npr. `' OR '1'='1`) u korisničko ime.
   
2. **CSRF**:
   - Otvorite stranicu za CSRF kako biste ažurirali status korisnika.
   - Uključite ili isključite ranjivost pomoću checkboxa.
   - Na temelju zadnjeg poslanog zahtjeva ((ne)označenog checkboxa) pokrenite CSRF Attack stranicu za izvođenje simuliranog CSRF napada.

## Testiranje svake ranjivosti
1. **SQL umetanje (SQL Injection)**:
   - Omogućite SQL Injection ranjivost i pokušajte unijeti SQL injection izraz.
   - Ako je ranjivost omogućena, aplikacija će dopustiti neovlašteni pristup.
   - Ako je onemogućena, aplikacija bi trebala blokirati neovlašteni pristup.

2. **CSRF**:
   - Omogućite CSRF ranjivost na CSRF stranici.
   - Pokušajte izvršiti napad putem CSRF Attack stranice.
   - Ako je ranjivost omogućena, napad bi trebao uspjeti.
   - Ako je onemogućena, napad bi trebao biti blokiran.

### Pokretanje lokalno
1. Klonirajte repozitorij.
2. Instalirajte ovisnosti: `npm install`
3. Pokrenite aplikaciju: `node app.js`
4. Pristupite aplikaciji na `http://localhost:3000`.