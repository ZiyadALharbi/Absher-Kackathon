import os 

from langchain_groq import ChatGroq # do we need to install this? how ? 


def get_llm():
    return ChatGroq(
        model="openai/gpt-oss-120b",
        api_key=os.getenv("GROQ_API_KEY"),
    )

