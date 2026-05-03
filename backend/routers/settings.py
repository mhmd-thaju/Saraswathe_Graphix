"""
PrintFlow ERP — Settings Router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=List[schemas.SettingsOut])
def get_all_settings(db: Session = Depends(get_db)):
    return db.query(models.Setting).all()


@router.get("/{key}", response_model=schemas.SettingsOut)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return setting


@router.put("/{key}", response_model=schemas.SettingsOut)
def update_setting(key: str, payload: schemas.SettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    if not setting:
        # Create new setting if not found
        setting = models.Setting(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    db.commit()
    db.refresh(setting)
    return setting


@router.put("", response_model=List[schemas.SettingsOut])
def bulk_update_settings(payload: dict, db: Session = Depends(get_db)):
    """Update multiple settings at once. Payload: {key: value, ...}"""
    updated = []
    for key, value in payload.items():
        setting = db.query(models.Setting).filter(models.Setting.key == key).first()
        if setting:
            setting.value = str(value)
        else:
            setting = models.Setting(key=key, value=str(value))
            db.add(setting)
        updated.append(setting)
    db.commit()
    for s in updated:
        db.refresh(s)
    return updated
