import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function CategoryPage() {
  const navigate = useNavigate()
  const { slug } = useParams()

  useEffect(() => {
    navigate(`/transactions?category=${slug}`, { replace: true })
  }, [navigate, slug])

  return null
}
