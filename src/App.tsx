import { Generated, Kysely, Migration, Migrator } from "kysely";
import React from "react";
import { SQLocalKysely } from "sqlocal/kysely";

type DB = {
  groceries: {
    id: Generated<number>;
    name: string;
  };
};

const { dialect } = new SQLocalKysely("database.sqlite3");
const db = new Kysely<DB>({ dialect });

const migrations: Record<string, Migration> = {
  "001_initial": {
    up: async (db: Kysely<any>) => {
      await db.schema
        .createTable("groceries")
        .addColumn("id", "integer", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .execute();
    },
    down: async (db: Kysely<any>) => {
      await db.schema.dropTable("person").execute();
    },
  },
};

const migrator = new Migrator({
  db,
  provider: { getMigrations: async () => migrations },
});

const App: React.FC = () => {
  // Define the callback function
  const startTest = async () => {
    await migrator.migrateToLatest();

    const data = await db
      .selectFrom("groceries")
      .select("name")
      .orderBy("name", "asc")
      .execute();

    console.log("fetched groceries", data);
  };

  return (
    <div className="p-10">
      <button
        onClick={startTest}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-75"
      >
        Start Test
      </button>
    </div>
  );
};

export default App;
