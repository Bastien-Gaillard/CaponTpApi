from datetime import datetime, timedelta
import random
import pandas as pd
fake_data = []

for i in range(1, 101):
    fake_data.append({
        "id": i,
        "name": f"Client {i}",
        "email": f"client{i}@example.com",
        "address": f"Adresse {i}, Ville {i}",
        "created_at": (datetime.now() - timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d %H:%M:%S")
    })

# Créer un DataFrame avec 100 clients fictifs
df_fake_customers = pd.DataFrame(fake_data)

# Sauvegarder dans un fichier CSV
fake_customer_file_path = "./fake_customers.csv"
df_fake_customers.to_csv(fake_customer_file_path, index=False)

fake_customer_file_path