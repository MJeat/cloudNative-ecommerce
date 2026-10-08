import express from "express";

export const getDashboard = (req,res) => {
    res.status(200).json({ meessage : "Successfully log in"})
} 