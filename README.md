# SkyBooker

Egy random házi projekt, amit unalomból kezdtem el, hogy fejlődjek
Reactban. Nincsen mögötte semmi szándék.

## Stack

- Backend - Java Springboot
- Frontend - ReactJS, Vanilla CSS
- Adatbázis - PostgreSQL
- Mock Data - Python w/ Faker

## Indítás Docker nélkül:

1. Kell egy PostgreSQL adatbázis, ehhez futtasd ezt:

```powershell
& "C:\Program Files\PostgreSQL\{verzio}\bin\psql.exe" -U postgres -c "CREATE DATABASE flightbooking;"
```

2. Futtasd a `mockdata.py` fájlt.
3. Indítsd el a backendet

```java
./gradlew bootRun
```

4. Indítsd el a frontendet

```powershell
npm install
npm run dev
```

5. Ha mindent jól csináltál és beírtad a saját adataidat akkor kész:)

## Indítás Dockerrel (Ajánlott)

```powershell
docker compose up --build
```

## Tudnivaló(k)

- Fogalmam sem volt, hogy miből állnak bizonyos komponensek mint pl, hogy mi az az 'iata code', tehát az adatstruktúrát az AI tervezte meg nekem, és ő magyarázott el nekem sok dolgot amik nélkül igazából 0 funkcionalitás lenne a weboldalon. Ez lehet valakinek szúrja a szemét, de ez van:)

- Mivel még kezdő vagyok ebben, ezért a Reacttól gyorsan kiégek még, ezért naponta általában 1-2 órát töltök a webbel és általában a munka előtt is utána kell néznem a dolgoknak és jól átgondolni, hogy mit akarok.

## Videók
Levideóztam a fejlesztésemet és utamat, hogy később tanulni tudjak belőle.
0 effort van a videókban, úgy éreztem hogy felveszem és felvettem.

- [10. Videó](https://youtu.be/gDG8U9bTNwo) - CustomSelect Common Component
- [9. Videó](https://youtu.be/AxO6JAMDNCw) - Theme Context, Contact Page
- [8. Videó](https://youtu.be/bIKdVYV2WcE) - 404 Oldal és React Router DOM
- [7. Videó](https://youtu.be/0tuvfuaQCFY) - Docker & Kevés debug
- [6. Videó](https://youtu.be/gnltEyXmwdk) - SeatSelector Addon
- [5. Videó](https://youtu.be/_Ev8G_iSq6I) - API & CORS
- [4. Videó](https://youtu.be/74ZMrw0w7_0) - My Bookings Page
- [3. Videó](https://youtu.be/-UsZ7uY9pKQ) - Confirmation Page
- [2. Videó](https://youtu.be/Coqe4rumCsI) - Booking Form
- [1. Videó](https://youtu.be/7Q3Nb3xZuE8) - Home Page (SHOWCASE)