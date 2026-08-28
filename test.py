import asyncio
import freeGPT
async def main():
    try:
        resp = await freeGPT.AsyncClient().create_completion('gpt3', 'hello')
        print(resp)
    except Exception as e:
        print(f"Error: {e}")
asyncio.run(main())
