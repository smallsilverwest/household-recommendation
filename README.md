## 🏠 Seoul Single Household Neighborhood Recommendation System
> **An interactive web service recommends optimized housing options based on safety filters and actual public transit commute times**

This project performs data processing, scaling, and normalization in a Google Colab environment and is successfully deployed as a live web application on Hugging Face Spaces using the Gradio library.

🌐 **[Live Demo on Hugging Face Spaces]** https://huggingface.co/spaces/smallsilverweswt/singlehousehold-recommendation

### 📌 1. Project Overview
This service was developed to support the rapidly growing population of single-person households in Seoul when searching for a residential area (haengjeongdong). Moving beyond simple price comparisons, this application dynamically calculates a personalized score for each neighborhood by analyzing **local amenities (medical, shopping, culture, etc.)**, **regional safety/crime rates**, and **real-time public transit duration** to a specific user-defined workplace or school.

---

### 🛠 2. Tech Stack & Dependencies
- **Language:** Python 3.x
- **Data Analysis:** Pandas, NumPy
- **API Integration:** Requests (Kakao Rest API, ODsay API)
- **UI & Deployment:** Gradio, Hugging Face Spaces

---

### 📊 3. Dataset & Preprocessing
The system computes recommendations using Seoul housing datasets for charter leases (`deposit.csv`) and monthly rentals (`monthly.csv`).

- **Commercial Data:** Quantifies regional infrastructure counts across 8 categories: Medical, Education, Shopping, Banking, Government, Culture, Intercity Transit, and Intracity Transit.
- **Crime Data:** Calculates local safety metrics based on crime rates and clearance rates per district, mapping them into specific weights: `SAFE(3)`, `NORMAL(2)`, and `DANGER(1)`.
- **Normalization:** Because amenity metrics and crime scores have entirely different scales, **Min-Max Scaling** is applied to standardize the distributions before computing the final recommendation score.

---

### ⚙️ 4. Core Algorithms & Key Features

#### 1) Weighted Recommendation Scoring
Based on the top 3 priority elements selected by the user, a weighted ratio (3:2:1) is dynamically mapped to calculate the total infrastructure score:
$$Facility\ Score = (1st\ Priority \times 3) + (2nd\ Priority \times 2) + (3rd\ Priority \times 1)$$

#### 2) Proxy Bypass & Header Spoofing for API Authentication
- **Kakao Rest API:** Converts a text-based destination or workplace address into exact Latitude/Longitude coordinates.
- **ODsay API:** Calculates the exact public transit routing and total travel duration (in minutes) from the candidate neighborhoods to the user's destination.
- **Header Spoofing Workaround:** When calling the API via Python `requests.get`, the system manually injects the Hugging Face static embed domain (`https://smallsilverweswt-singlehousehold-recommendation.hf.space`) into the HTTP `Origin` and `Referer` headers. This effectively bypasses ODsay's strict domain/CORS authentication layer designed for Web API keys.

---

### 🖥️ 5. UI Layout & Architecture
Built with Gradio to deliver a responsive, form-based front-end interface:

- **Conditional UI Form:** Selecting 'Jeonse' (Charter) only activates the deposit input field, while switching to 'Monthly Rent' dynamically opens an additional rental budget field.
- **Priority Filtering:** Allows users to freely rank their top 3 vital living conditions out of 8 categories.
- **Commute Tracker:** When toggled on, it automatically filters out any neighborhood that exceeds the user's maximum acceptable travel duration, returning the top 3 optimal matching residential options.

---

### 🚀 6. Local Execution Guide (How to Run `main.ipynb`)

If you wish to bypass the Hugging Face web link and execute the raw source code (`main.ipynb`) locally or in a Google Colab notebook, you must configure the following runtime settings due to ODSay's IP/Domain security constraints:

#### 1) Adjust CSV File Directories
- The default dataset loading script utilizes relative paths. When running on Colab, you need to adjust the file directories inside `pd.read_csv()` to map your specific Google Drive mounting path or local workspace folders (e.g., modifying paths to point into the `dataset/` directory).

#### 2) Acquire and Input Personal API Keys
- You must register and obtain credentials from Kakao Developers and the ODsay Open API Center, then paste them into the `YOUR KAKAO_API_KEY` and `YOUR ODSAY_API_KEY` variables at the top of the script.

#### 3) Fetch Outbound IP & Register to ODsay Panel ★
- Local machines and Google Colab environments use dynamic outbound IPs. To pass ODsay's Server/REST authentication check when running a local notebook, you must find your runtime environment's public IP address.
- The notebook contains a block that fetches your dynamic public IP via an external lookup service:
```python
  import requests
  current_ip = requests.get("[https://api.ipify.org](https://api.ipify.org)").text
  print(f"Current Runtime Environment Public IP: {current_ip}")
```
Copy the printed IP string and save it into ODsay Developer Center > My Page > Application Settings > Server IP Whitelist prior to launching the Gradio server. Skipping this configuration will trigger an explicit ApiKeyAuthFailed error.

### 📂 7. Repository Structure & Deployment Mapping

The layout of this GitHub repository maintains a structured pipeline for data science development, tracking the transition from raw source files to intermediate preprocessed checkpoints, and finally to the production-ready datasets.

#### GitHub Repository Structure
```text
├── main.ipynb                       # Pipeline testing, Gradio UI Gradio verification
├── Preprocessing/                   # Data preprocessing steps
│   ├── commercial.ipynb             # Cleaning and merging commercial dataset
│   ├── coord.ipynb                  # Fetching and parsing coordinate dataset
│   ├── crime.ipynb                  # Processing regional crime grade
│   ├── merge.ipynb                  # Joining datasets and engineering recommendation factors
│   └── rent.ipynb                   # Parsing raw estate transaction data
│
└── Dataset/                         # Data directory
    ├── Origin/                      # Raw, unaltered source datasets
    │   ├── beopjeongdong.xlsx       # Boepjeongdong to Haengjeongdong mapping spreadsheet
    │   ├── commercial.csv           # Raw dataset
    │   ├── crime.csv                
    │   └── rent.zip                 
    │
    ├── Preprocessed/                # Data checkpoints generated during preprocessing
    │   ├── commercial_group.csv
    │   ├── crime_grade.csv
    │   ├── dong_coord.csv
    │   ├── merge_deposit.csv
    │   ├── merge_monthly.csv
    │   ├── rent_deposit.csv
    │   └── rent_montly.csv
    │
    ├── deposit.csv      # Final integrated Deposit data
    └── monthly.csv      # Final integrated Monthly data
```

#### Deployment Mapping (GitHub ➡️ Hugging Face Spaces)

When moving this architecture into production on Hugging Face Spaces, the repository layout was flattened into a containerized, single-directory runtime environment to ensure seamless asset references and minimize container sizes:

- **Source Code:** main.ipynb was refactored and optimized into a production-ready app.py script (the primary entry point for Hugging Face).
- **Datasets:** Only the two production datasets (deposit.csv and monthly.csv) inside the root of dataset/ were extracted and uploaded directly alongside app.py to prevent path routing issues.
- **Environment Configuration:** A requirements.txt file was introduced at the Hugging Face root to automatically trigger the installation of cloud engine dependencies (pandas, gradio, requests, etc.).
