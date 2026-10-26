# ASD1-M1-08 — Laboratorium kolejek

**Temat:** Kolejki i bufory cykliczne  
**Przedmiot:** Algorytmy i struktury danych I  
**Autor:** Daniel Balkevic  
**Numer indeksu:** 94035

## Cel
Aplikacja pokazuje różnice między kolejką z przesuwaniem, kolejką cykliczną i deque. Użytkownik może wykonywać operacje ręcznie lub krokowo, obserwować fizyczną tablicę i kolejność logiczną, uruchamiać scenariusze oraz porównywać liczniki operacji.

## Uruchomienie
1. Pobierz repozytorium lub rozpakuj folder projektu.
2. Otwórz `index.html` w aktualnej przeglądarce. Nie potrzeba instalacji ani konta.
3. Wybierz tryb, pojemność i dane. Użyj przycisków operacji, „Krok scenariusza” lub „Start”.

Interfejs korzysta z `queue-core.js` oraz `app.js`. Arkusz stylów znajduje się w `style.css`.

## Uruchomienie testów
Wymagany jest Node.js 18 lub nowszy. W katalogu projektu uruchom:
```bash
node --test tests/queue-core.test.js
```
Nie wpisuj do raportu, że testy przeszły, dopóki nie uruchomisz ich lokalnie. Zapisz rzeczywisty wynik.

## Pliki
- `index.html` — interfejs aplikacji.
- `style.css` — wygląd i układ responsywny.
- `queue-core.js` — implementacje badanych struktur.
- `app.js` — obsługa interfejsu, kroki, scenariusze, porównanie i quiz.
- `tests/queue-core.test.js` — testy automatyczne.
- `docs/` — miejsce na prezentację i dokumentację projektu.

## Model algorytmów
- Kolejka z przesuwaniem: enqueue O(1), dequeue O(n), pamięć O(C).
- Kolejka cykliczna: enqueue O(1), dequeue O(1), pamięć O(C).
- Deque: operacje na obu końcach O(1), pamięć O(C).
- `C` oznacza pojemność tablicy, a `n` aktualny rozmiar.

## Liczniki porównania
Licznik odczytów i zapisów dotyczy dostępu do komórek/elementów w implementacji. Licznik przesunięć zwiększa się, gdy kolejka z przesuwaniem kopiuje element do poprzedniej komórki. Liczniki nie obejmują rysowania UI, historii klatek ani walidatora.

## Wykorzystanie AI i wkład własny
Sztuczna inteligencja stanowi kluczowy element działania agenta, umożliwiając mu interpretowanie poleceń i wspieranie realizacji zadań. Podczas tworzenia projektu najważniejszy był mój wkład własny w konfigurację, integrację poszczególnych elementów oraz testowanie i rozwijanie rozwiązania.
