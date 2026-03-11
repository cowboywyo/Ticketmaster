import { Request, Response } from 'express';
import * as followersService from './followers.service.js';

export async function list(req: Request, res: Response) {
  const followers = await followersService.getExplicitFollowers(req.params.ticketId as string);
  res.json({ followers });
}

export async function follow(req: Request, res: Response) {
  await followersService.followTicket(req.params.ticketId as string, req.user!.userId);
  res.status(201).json({ message: 'Now following' });
}

export async function unfollow(req: Request, res: Response) {
  await followersService.unfollowTicket(req.params.ticketId as string, req.user!.userId);
  res.json({ message: 'Unfollowed' });
}

export async function status(req: Request, res: Response) {
  const following = await followersService.isFollowing(req.params.ticketId as string, req.user!.userId);
  res.json({ following });
}
