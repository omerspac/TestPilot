from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

from ....core.database import get_db
from ....models.user import User
from ....models.website import Website as WebsiteModel
from ....schemas.website import Website, WebsiteCreate, WebsiteUpdate
from ...deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[Website])
async def get_websites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(WebsiteModel).where(WebsiteModel.user_id == current_user.id)
    )
    return result.scalars().all()

@router.post("/", response_model=Website)
async def create_website(
    website_in: WebsiteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_obj = WebsiteModel(
        **website_in.model_dump(),
        user_id=current_user.id
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/{website_id}", response_model=Website)
async def get_website(
    website_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(WebsiteModel).where(
            WebsiteModel.id == website_id,
            WebsiteModel.user_id == current_user.id
        )
    )
    website = result.scalar_one_or_none()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return website

@router.put("/{website_id}", response_model=Website)
async def update_website(
    website_id: int,
    website_in: WebsiteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(WebsiteModel).where(
            WebsiteModel.id == website_id,
            WebsiteModel.user_id == current_user.id
        )
    )
    website = result.scalar_one_or_none()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    update_data = website_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(website, field, value)
    
    db.add(website)
    await db.commit()
    await db.refresh(website)
    return website

@router.delete("/{website_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_website(
    website_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(WebsiteModel).where(
            WebsiteModel.id == website_id,
            WebsiteModel.user_id == current_user.id
        )
    )
    website = result.scalar_one_or_none()
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    
    await db.delete(website)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
