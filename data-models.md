Data sets: [bookings, tours, locations, users, reviews]

1. users and reviews: 1:many, parent referencing, parent:child

2. tours and reviews: 1:many, parent referencing, parent:child

3. tours and locaions: few:few, embedding

4. tours and users(tour-guides, guides): few:few, child referencing or embedding,

5. tours and booking: 1:many, parent referencing, parent:child

6. users and booking: 1:many, parent referencing, parent:child
