class DbUtilities {
    constructor(db) {
        this.db = db;
        this.page = 1;
    }

    static async syncTable(db, table, maxPages = 20) {
        table = table || null;
        if (table) {
            let count = await db[table].count();
            if (count === 0) {
                let instance = new DbUtilities(db);
                await instance.fetchTable(table, maxPages);
            }
        }
    }

    async fetchTable(table, maxPages) {
        if (maxPages && this.page > maxPages) return;
        let res = await fetch(`https://pgsc.survos.com/api/${table}?page=${this.page}`);
        let data = await res.json();
        if (data.member.length > 0) {
            data.member.forEach(row => {
                this.db[table].add(row);
            });
            this.page++;
            await this.fetchTable(table, maxPages); // Fetch next page
        }
    }
}

export { DbUtilities };
