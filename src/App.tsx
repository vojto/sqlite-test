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

      await db
        .insertInto("groceries")
        .values([{ name: "Milk" }, { name: "Eggs" }])
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
  const [groceries, setGroceries] = React.useState<
    { id: number; name: string }[]
  >([]);

  // Define the callback function
  const fetchGroceries = async () => {
    await migrator.migrateToLatest();

    const data = await db
      .selectFrom("groceries")
      .select(["id", "name"])
      .orderBy("id", "asc")
      .execute();

    setGroceries(data);

    console.log("fetched groceries", data);
  };

  const insertItem = async () => {
    const name = prompt("Enter grocery name");

    if (!name) {
      return;
    }

    await db.insertInto("groceries").values({ name }).execute();

    await fetchGroceries();
  };

  return (
    <div className="p-10">
      <div className="flex space-x-2">
        <button
          onClick={fetchGroceries}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-75"
        >
          Fetch groceries
        </button>

        <button
          onClick={insertItem}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-75"
        >
          Add item
        </button>
      </div>

      {/* Table structure */}
      <div className="mt-4">
        <table className="table-auto w-full mt-2">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Name</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {groceries.map((grocery) => (
              <tr
                className="border-b border-gray-200 hover:bg-gray-100"
                key={grocery.id}
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {grocery.id}
                </td>
                <td className="py-3 px-6 text-left">{grocery.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
