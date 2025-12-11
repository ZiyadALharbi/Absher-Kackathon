import os 

from langchain_groq import ChatGroq


def get_llm():
    return ChatGroq(
        model="openai/gpt-oss-120b",
        api_key=os.getenv("GROQ_API_KEY"),
        streaming=True,
    )


from langchain_ollama import ChatOllama # do we need to install this? how ? 


# def get_llm():
#     return ChatOllama(
#         model="qwen3:4b",
#         temperature=0,
#         streaming=True,
#     )

